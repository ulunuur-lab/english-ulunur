"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createLesson(formData: FormData) {
  await requireAuth("teacher");

  const title = formData.get("title") as string;
  const skill = formData.get("skill") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !skill || !content) {
    throw new Error("Title, skill, and content are required");
  }

  const maxOrder = await prisma.lesson.aggregate({
    _max: { orderIndex: true },
  });

  await prisma.lesson.create({
    data: {
      title,
      skill,
      content,
      isPublished,
      orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
    },
  });

  redirect("/teacher/lessons");
}

export async function updateLesson(formData: FormData) {
  await requireAuth("teacher");

  const id = parseInt(formData.get("id") as string, 10);
  const title = formData.get("title") as string;
  const skill = formData.get("skill") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "on";

  if (!id || !title || !skill || !content) {
    throw new Error("All fields are required");
  }

  await prisma.lesson.update({
    where: { id },
    data: {
      title,
      skill,
      content,
      isPublished,
    },
  });

  redirect("/teacher/lessons");
}

export async function deleteLesson(formData: FormData) {
  await requireAuth("teacher");

  const id = parseInt(formData.get("id") as string, 10);

  await prisma.lesson.delete({
    where: { id },
  });

  revalidatePath("/teacher/lessons");
}

export async function togglePublish(formData: FormData) {
  await requireAuth("teacher");

  const id = parseInt(formData.get("id") as string, 10);
  const currentStatus = formData.get("isPublished") === "true";

  await prisma.lesson.update({
    where: { id },
    data: { isPublished: !currentStatus },
  });

  revalidatePath("/teacher/lessons");
}
