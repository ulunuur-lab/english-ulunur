"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "@/lib/telegram";

export async function submitTopicQuiz(topicId: number, score: number, totalQuestions: number) {
  const session = await requireAuth("student");
  const percentage = Math.round((score / totalQuestions) * 100);

  // Update or create topic progress
  const current = await prisma.userTopicProgress.findUnique({
    where: { userId_topicId: { userId: session.userId, topicId } },
  });

  const isCompleted = percentage >= 70; // 70% passing grade to clear the level

  await prisma.userTopicProgress.upsert({
    where: { userId_topicId: { userId: session.userId, topicId } },
    update: {
      score: Math.max(current?.score || 0, percentage),
      status: isCompleted ? "completed" : "unlocked",
      completedAt: isCompleted ? new Date() : undefined,
    },
    create: {
      userId: session.userId,
      topicId,
      score: percentage,
      status: isCompleted ? "completed" : "unlocked",
      completedAt: isCompleted ? new Date() : undefined,
    },
  });

  // If completed, unlock the next topic node automatically!
  let nextTopicUnlocked: string | null = null;
  if (isCompleted) {
    const nextTopic = await prisma.roadmapTopic.findFirst({
      where: { orderIndex: topicId + 1 },
    });

    if (nextTopic) {
      await prisma.userTopicProgress.upsert({
        where: { userId_topicId: { userId: session.userId, topicId: nextTopic.id } },
        update: {
          status: "unlocked",
        },
        create: {
          userId: session.userId,
          topicId: nextTopic.id,
          status: "unlocked",
        },
      });
      nextTopicUnlocked = nextTopic.title;
    }
  }

  // Create an Activity Log
  const topic = await prisma.roadmapTopic.findUnique({ where: { id: topicId } });
  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: isCompleted ? "quest_completed" : "quest_attempted",
      details: JSON.stringify({
        topicId,
        title: topic?.title,
        score: percentage,
        passed: isCompleted,
      }),
    },
  });

  // Push Telegram Alert to Teacher
  await sendTelegramNotification({
    studentName: session.name,
    type: "lesson_completed",
    title: isCompleted ? `Cleared Quest #${topicId}: ${topic?.title}` : `Attempted Quest #${topicId}`,
    details: `${score}/${totalQuestions} correct (${percentage}%). ${
      nextTopicUnlocked ? `Unlocked Next: "${nextTopicUnlocked}"` : ""
    }`,
    score: `${percentage}%`,
    link: `http://localhost:3000/roadmap`,
  });

  revalidatePath("/roadmap");
  revalidatePath("/dashboard");
  return { success: true, passed: isCompleted, score: percentage };
}
