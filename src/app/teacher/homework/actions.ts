"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createHomework(formData: FormData) {
  await requireAuth("teacher");

  const title = formData.get("title") as string;
  const instructions = formData.get("instructions") as string;
  const type = formData.get("type") as string;
  const dueDate = formData.get("dueDate") as string;

  if (!title || !instructions || !type || !dueDate) {
    throw new Error("All fields are required");
  }

  // Find the student user (there's only one)
  const student = await prisma.user.findFirst({
    where: { role: "student" },
  });

  if (!student) {
    throw new Error("No student found");
  }

  await prisma.homework.create({
    data: {
      title,
      instructions,
      type,
      dueDate: new Date(dueDate),
      assignedToId: student.id,
    },
  });

  redirect("/teacher/homework");
}

export async function reviewHomework(formData: FormData) {
  await requireAuth("teacher");

  const id = parseInt(formData.get("id") as string, 10);
  const feedback = formData.get("feedback") as string;
  const score = parseInt(formData.get("score") as string, 10);

  if (!id || !feedback || isNaN(score)) {
    throw new Error("Feedback and score are required");
  }

  if (score < 0 || score > 100) {
    throw new Error("Score must be between 0 and 100");
  }

  await prisma.homework.update({
    where: { id },
    data: {
      status: "reviewed",
      teacherFeedback: feedback,
      score,
    },
  });

  revalidatePath("/teacher/homework");
  redirect("/teacher/homework");
}
