import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import EditLessonForm from "./EditLessonForm";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!lesson) {
    notFound();
  }

  return (
    <EditLessonForm
      lesson={{
        id: lesson.id,
        title: lesson.title,
        skill: lesson.skill,
        content: lesson.content,
        isPublished: lesson.isPublished,
      }}
    />
  );
}
