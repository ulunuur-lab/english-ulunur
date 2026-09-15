import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "@/lib/telegram";

async function markCompleteAction(lessonId: number) {
  "use server";
  const session = await requireAuth("student");
  
  await prisma.lessonProgress.upsert({
    where: { lessonId_userId: { lessonId, userId: session.userId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: { lessonId, userId: session.userId, isCompleted: true, completedAt: new Date() }
  });

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });

  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "lesson_completed",
      details: JSON.stringify({ lessonId, title: lesson?.title })
    }
  });

  // Telegram alert to teacher
  await sendTelegramNotification({
    studentName: session.name,
    type: "lesson_completed",
    title: `Completed Lesson: "${lesson?.title || 'Lesson'}"`,
    details: `Skill: ${lesson?.skill || 'General'}`,
    link: `http://localhost:3000/lessons/${lessonId}`,
  });

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath('/dashboard');
  revalidatePath('/lessons');
}

export default async function LessonDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAuth("student");
  const lessonId = parseInt(params.id, 10);
  
  if (isNaN(lessonId)) return notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { progress: { where: { userId: session.userId } } }
  });

  if (!lesson) return notFound();

  const isCompleted = lesson.progress.length > 0 && lesson.progress[0].isCompleted;

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <nav className="flex items-center text-sm font-medium text-slate-500 mb-6">
        <Link href="/lessons" className="hover:text-indigo-600 transition">Lessons</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-slate-900">{lesson.title}</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700 mb-4">
            {lesson.skill}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
        </div>
        
        <div className="p-8 prose-lesson max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end">
          {isCompleted ? (
            <div className="flex items-center text-emerald-600 font-semibold bg-emerald-50 px-6 py-3 rounded-xl">
              <CheckCircle2 className="mr-2" /> Completed
            </div>
          ) : (
            <form action={markCompleteAction.bind(null, lesson.id)}>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition">
                Mark as Complete
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
