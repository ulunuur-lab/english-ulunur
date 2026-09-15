import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const skillColors: Record<string, string> = {
  grammar: "bg-blue-100 text-blue-700",
  vocabulary: "bg-purple-100 text-purple-700",
  reading: "bg-emerald-100 text-emerald-700",
  listening: "bg-amber-100 text-amber-700",
  writing: "bg-rose-100 text-rose-700",
  speaking: "bg-orange-100 text-orange-700"
};

export default async function LessonsPage() {
  const session = await requireAuth("student");
  const userId = session.userId;

  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true },
    include: { progress: { where: { userId } } },
    orderBy: { orderIndex: 'asc' }
  });

  const skills = ["grammar", "vocabulary", "reading", "listening", "writing", "speaking"];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Lessons</h1>
        <p className="text-slate-500 mt-2">Continue your journey to B2</p>
      </div>

      <div className="space-y-12">
        {skills.map(skill => {
          const skillLessons = lessons.filter(l => l.skill === skill);
          if (skillLessons.length === 0) return null;

          return (
            <div key={skill}>
              <h2 className="text-xl font-bold text-slate-900 capitalize mb-4 pb-2 border-b border-slate-100">{skill}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillLessons.map(lesson => {
                  const isCompleted = lesson.progress.length > 0 && lesson.progress[0].isCompleted;
                  return (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide", skillColors[skill] || "bg-slate-100 text-slate-700")}>
                          {skill}
                        </span>
                        {isCompleted && <CheckCircle2 className="text-emerald-500" size={20} />}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
