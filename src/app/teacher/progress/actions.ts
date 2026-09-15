"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const SKILLS = ["reading", "writing", "listening", "speaking", "grammar", "vocabulary"];

export async function updateProgress(formData: FormData) {
  await requireAuth("teacher");

  const student = await prisma.user.findFirst({
    where: { role: "student" },
  });

  if (!student) {
    throw new Error("No student found");
  }

  for (const skill of SKILLS) {
    const scoreStr = formData.get(skill) as string;
    const score = parseInt(scoreStr, 10);

    if (isNaN(score) || score < 0 || score > 100) continue;

    await prisma.progress.upsert({
      where: {
        userId_skill: {
          userId: student.id,
          skill,
        },
      },
      update: { score },
      create: {
        userId: student.id,
        skill,
        score,
      },
    });
  }

  revalidatePath("/teacher/progress");
}
