"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SessionData, defaultSession, sessionOptions } from "@/lib/session";

// We use a dynamic import for bcryptjs since it may cause issues with edge runtime
import bcrypt from "bcryptjs";

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.name = user.name;
  session.email = user.email;
  session.role = user.role as "teacher" | "student";
  session.isLoggedIn = true;
  await session.save();

  if (user.role === "teacher") {
    redirect("/teacher");
  } else {
    redirect("/dashboard");
  }
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

export async function requireAuth(role?: "teacher" | "student"): Promise<SessionData> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  if (role && session.role !== role) {
    redirect(session.role === "teacher" ? "/teacher" : "/dashboard");
  }
  return session as SessionData;
}
