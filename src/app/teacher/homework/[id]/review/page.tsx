import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ReviewHomeworkForm from "./ReviewHomeworkForm";

export default async function ReviewHomeworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const homework = await prisma.homework.findUnique({
    where: { id: parseInt(id, 10) },
    include: { assignedTo: true },
  });

  if (!homework) {
    notFound();
  }

  return (
    <ReviewHomeworkForm
      homework={{
        id: homework.id,
        title: homework.title,
        instructions: homework.instructions,
        type: homework.type,
        status: homework.status,
        studentResponse: homework.studentResponse,
        fileUrl: homework.fileUrl,
        teacherFeedback: homework.teacherFeedback,
        score: homework.score,
        studentName: homework.assignedTo.name,
      }}
    />
  );
}
