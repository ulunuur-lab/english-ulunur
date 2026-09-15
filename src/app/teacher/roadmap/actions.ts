"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleTopicLock(topicId: number, currentStatus: string) {
  await requireAuth("teacher");

  const student = await prisma.user.findFirst({ where: { role: "student" } });
  if (!student) throw new Error("Student not found");

  const nextStatus = currentStatus === "locked" ? "unlocked" : "locked";

  await prisma.userTopicProgress.upsert({
    where: { userId_topicId: { userId: student.id, topicId } },
    update: { status: nextStatus },
    create: { userId: student.id, topicId, status: nextStatus },
  });

  revalidatePath("/teacher/roadmap");
  revalidatePath("/roadmap");
}

export async function unlockWorld(worldId: number) {
  await requireAuth("teacher");

  const student = await prisma.user.findFirst({ where: { role: "student" } });
  if (!student) throw new Error("Student not found");

  const topics = await prisma.roadmapTopic.findMany({ where: { world: worldId } });

  for (const t of topics) {
    await prisma.userTopicProgress.upsert({
      where: { userId_topicId: { userId: student.id, topicId: t.id } },
      update: { status: "unlocked" },
      create: { userId: student.id, topicId: t.id, status: "unlocked" },
    });
  }

  revalidatePath("/teacher/roadmap");
  revalidatePath("/roadmap");
}
