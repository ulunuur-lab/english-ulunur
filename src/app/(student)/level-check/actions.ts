"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "@/lib/telegram";

export async function submitLevelCheck(score: number, totalQuestions: number, type: "diagnostic" | "weekly", weekNumber?: number) {
  const session = await requireAuth("student");
  const percentage = Math.round((score / totalQuestions) * 100);

  // CEFR calculation
  let levelResult = "B1.1";
  if (percentage >= 90) levelResult = "B2+ (Exam Ready! 🏁)";
  else if (percentage >= 80) levelResult = "B2.2";
  else if (percentage >= 70) levelResult = "B2.1";
  else if (percentage >= 60) levelResult = "B1+";
  else if (percentage >= 50) levelResult = "B1.2";
  else levelResult = "B1.1";

  // Record LevelCheck entry
  const check = await prisma.levelCheck.create({
    data: {
      userId: session.userId,
      type,
      weekNumber: weekNumber || 1,
      score: percentage,
      levelResult,
      breakdown: JSON.stringify({ score, totalQuestions, percentage }),
    },
  });

  // Also update overall CEFR progress score for student
  const skills = ["grammar", "vocabulary", "reading"];
  for (const skill of skills) {
    await prisma.progress.upsert({
      where: { userId_skill: { userId: session.userId, skill } },
      update: { score: percentage },
      create: { userId: session.userId, skill, score: percentage },
    });
  }

  // If this was an initial diagnostic and student scored well, unlock corresponding roadmap quests!
  if (type === "diagnostic") {
    // Determine how many starter quests to unlock based on diagnostic score
    // E.g. >70% unlocks first 6 quests (half of World 1)
    const questsToUnlock = percentage >= 70 ? 6 : percentage >= 50 ? 3 : 1;
    for (let i = 1; i <= questsToUnlock; i++) {
      await prisma.userTopicProgress.upsert({
        where: { userId_topicId: { userId: session.userId, topicId: i } },
        update: { status: "completed", score: percentage },
        create: { userId: session.userId, topicId: i, status: "completed", score: percentage },
      });
    }
    // Unlock the subsequent quest
    const nextQ = questsToUnlock + 1;
    if (nextQ <= 60) {
      await prisma.userTopicProgress.upsert({
        where: { userId_topicId: { userId: session.userId, topicId: nextQ } },
        update: { status: "unlocked" },
        create: { userId: session.userId, topicId: nextQ, status: "unlocked" },
      });
    }
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "level_check_completed",
      details: JSON.stringify({ type, score: percentage, levelResult }),
    },
  });

  // Telegram alert to teacher
  await sendTelegramNotification({
    studentName: session.name,
    type: "level_check_completed",
    title: type === "diagnostic" ? "Completed Baseline Level Check" : `Completed Week ${weekNumber} Milestone Check`,
    details: `Scored ${score}/${totalQuestions} (${percentage}%). Level: ${levelResult}`,
    score: levelResult,
    link: "http://localhost:3000/teacher/progress",
  });

  revalidatePath("/level-check");
  revalidatePath("/roadmap");
  revalidatePath("/progress");
  revalidatePath("/dashboard");

  return { success: true, percentage, levelResult };
}
