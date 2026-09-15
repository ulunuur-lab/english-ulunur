import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "@/lib/telegram";

async function submitHomeworkAction(formData: FormData) {
  "use server";
  const session = await requireAuth("student");
  const hwId = parseInt(formData.get("hwId") as string, 10);
  const response = formData.get("response") as string;

  if (isNaN(hwId) || !response) return;

  const updatedHw = await prisma.homework.update({
    where: { id: hwId, assignedToId: session.userId },
    data: { 
      studentResponse: response,
      status: "submitted"
    }
  });

  await prisma.activityLog.create({
    data: {
      userId: session.userId,
      action: "homework_submitted",
      details: JSON.stringify({ homeworkId: hwId })
    }
  });

  // Telegram alert to teacher
  await sendTelegramNotification({
    studentName: session.name,
    type: "homework_submitted",
    title: `Submitted Homework: "${updatedHw.title}"`,
    details: `Preview: "${response.slice(0, 120)}${response.length > 120 ? "..." : ""}"`,
    link: `http://localhost:3000/teacher/homework/${hwId}/review`,
  });

  revalidatePath(`/homework/${hwId}`);
  revalidatePath('/dashboard');
  revalidatePath('/homework');
}

export default async function HomeworkDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAuth("student");
  const hwId = parseInt(params.id, 10);
  
  if (isNaN(hwId)) return notFound();

  const hw = await prisma.homework.findUnique({
    where: { id: hwId, assignedToId: session.userId }
  });

  if (!hw) return notFound();

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <nav className="flex items-center text-sm font-medium text-slate-500 mb-6">
        <Link href="/homework" className="hover:text-indigo-600 transition">Homework</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-slate-900">{hw.title}</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-slate-200 text-slate-700">
              {hw.type.replace('_', ' ')}
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-700">
              {hw.status.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{hw.title}</h1>
        </div>
        
        <div className="p-8 prose-lesson max-w-none border-b border-slate-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{hw.instructions}</ReactMarkdown>
        </div>

        <div className="p-8 bg-slate-50">
          {(hw.status === "assigned" || hw.status === "in_progress") && (
            <form action={submitHomeworkAction} className="space-y-4">
              <input type="hidden" name="hwId" value={hw.id} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Answer</label>
                <textarea 
                  name="response" 
                  rows={8}
                  className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4"
                  placeholder="Write your response here..."
                  defaultValue={hw.studentResponse || ""}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition">
                  Submit Homework
                </button>
              </div>
            </form>
          )}

          {hw.status === "submitted" && (
            <div>
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 font-medium">
                Your homework is waiting for teacher review.
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Your Submission:</h3>
              <div className="bg-white p-6 rounded-xl border border-slate-200 whitespace-pre-wrap text-slate-700">
                {hw.studentResponse}
              </div>
            </div>
          )}

          {hw.status === "reviewed" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-6 rounded-xl">
                <div>
                  <h3 className="font-bold text-lg mb-1">Homework Reviewed</h3>
                  <p className="text-sm opacity-90">Great job completing your assignment!</p>
                </div>
                <div className="text-4xl font-black">{hw.score}<span className="text-xl font-normal opacity-70">/100</span></div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Teacher's Feedback:</h3>
                <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm whitespace-pre-wrap text-slate-800">
                  {hw.teacherFeedback || "No specific feedback provided."}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Your Submission:</h3>
                <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 whitespace-pre-wrap text-slate-600">
                  {hw.studentResponse}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
