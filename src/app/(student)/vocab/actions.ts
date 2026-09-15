"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { calculateSM2, mapResponseToQuality } from "@/lib/srs";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "@/lib/telegram";

export async function getCardsForReview() {
  await requireAuth("student");

  const now = new Date();

  const dueCards = await prisma.vocabCard.findMany({
    where: {
      OR: [
        { progress: null },
        {
          progress: {
            nextReview: {
              lte: now,
            },
          },
        },
      ],
    },
    include: {
      progress: true,
    },
    take: 20,
  });

  return dueCards;
}

export async function submitCardReview(cardId: number, response: 'again' | 'hard' | 'good' | 'easy') {
  const session = await requireAuth("student");

  const card = await prisma.vocabCard.findUnique({
    where: { id: cardId },
    include: { progress: true },
  });

  if (!card) throw new Error("Card not found");

  const quality = mapResponseToQuality(response);
  const now = new Date();

  const progress = card.progress || {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
  };

  const nextState = calculateSM2(quality, progress.repetitions, progress.easeFactor, progress.interval);
  
  const nextReview = new Date(now.getTime() + nextState.interval * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.vocabProgress.upsert({
      where: { cardId },
      create: {
        cardId,
        easeFactor: nextState.easeFactor,
        interval: nextState.interval,
        repetitions: nextState.repetitions,
        lastReview: now,
        nextReview: nextReview,
      },
      update: {
        easeFactor: nextState.easeFactor,
        interval: nextState.interval,
        repetitions: nextState.repetitions,
        lastReview: now,
        nextReview: nextReview,
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: session.userId,
        action: "vocab_reviewed",
        details: JSON.stringify({ cardId, response, quality, nextInterval: nextState.interval }),
      },
    }),
  ]);

  revalidatePath("/vocab");
  revalidatePath("/vocab/review");
}

export async function completeVocabSession(reviewedCount: number, correctCount: number) {
  const session = await requireAuth("student");
  const accuracy = Math.round((correctCount / Math.max(1, reviewedCount)) * 100);

  await sendTelegramNotification({
    studentName: session.name,
    type: "vocab_reviewed",
    title: "Completed Flashcards Review Session",
    details: `Reviewed ${reviewedCount} cards with ${accuracy}% accuracy (${correctCount} correct).`,
    score: `${accuracy}%`,
    link: "http://localhost:3000/vocab",
  });
}
