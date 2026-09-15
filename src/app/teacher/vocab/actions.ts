"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createVocabList(formData: FormData) {
  await requireAuth("teacher");

  const topic = formData.get("topic") as string;
  const description = formData.get("description") as string;

  if (!topic) {
    throw new Error("Topic is required");
  }

  const list = await prisma.vocabList.create({
    data: {
      topic,
      description: description || null,
    },
  });

  redirect(`/teacher/vocab/${list.id}/edit`);
}

export async function addVocabCard(formData: FormData) {
  await requireAuth("teacher");

  const listId = parseInt(formData.get("listId") as string, 10);
  const word = formData.get("word") as string;
  const definition = formData.get("definition") as string;
  const exampleSentence = formData.get("exampleSentence") as string;

  if (!listId || !word || !definition) {
    throw new Error("Word and definition are required");
  }

  await prisma.vocabCard.create({
    data: {
      listId,
      word,
      definition,
      exampleSentence: exampleSentence || null,
    },
  });

  revalidatePath(`/teacher/vocab/${listId}/edit`);
}

export async function deleteVocabCard(formData: FormData) {
  await requireAuth("teacher");

  const cardId = parseInt(formData.get("cardId") as string, 10);
  const listId = parseInt(formData.get("listId") as string, 10);

  await prisma.vocabCard.delete({
    where: { id: cardId },
  });

  revalidatePath(`/teacher/vocab/${listId}/edit`);
}
