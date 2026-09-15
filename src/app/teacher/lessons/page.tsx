import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteLesson, togglePublish } from "./actions";

const skillBadgeColors: Record<string, string> = {
  grammar: "bg-blue-100 text-blue-700",
  vocabulary: "bg-violet-100 text-violet-700",
  reading: "bg-emerald-100 text-emerald-700",
  listening: "bg-amber-100 text-amber-700",
  writing: "bg-rose-100 text-rose-700",
  speaking: "bg-cyan-100 text-cyan-700",
};

export default async function TeacherLessons() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      _count: {
        select: { progress: { where: { isCompleted: true } } },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lessons</h1>
          <p className="text-slate-500 mt-1">
            Manage your lesson content and curriculum
          </p>
        </div>
        <Link
          href="/teacher/lessons/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Lesson
        </Link>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            No lessons yet
          </h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Create your first lesson to start building the curriculum for your
            student.
          </p>
          <Link
            href="/teacher/lessons/new"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Lesson
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
              >
                {/* Drag Handle / Order */}
                <div className="flex items-center gap-2 text-slate-400">
                  <GripVertical className="w-5 h-5" />
                  <span className="text-xs font-mono w-6 text-center">
                    {lesson.orderIndex + 1}
                  </span>
                </div>

                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 text-xs font-medium rounded-full capitalize",
                        skillBadgeColors[lesson.skill] ||
                          "bg-slate-100 text-slate-600"
                      )}
                    >
                      {lesson.skill}
                    </span>
                    {lesson._count.progress > 0 && (
                      <span className="text-xs text-emerald-600 font-medium">
                        ✓ Completed by student
                      </span>
                    )}
                  </div>
                </div>

                {/* Published Toggle */}
                <form action={togglePublish}>
                  <input type="hidden" name="id" value={lesson.id} />
                  <input
                    type="hidden"
                    name="isPublished"
                    value={String(lesson.isPublished)}
                  />
                  <button
                    type="submit"
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      lesson.isPublished
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {lesson.isPublished ? "Published" : "Draft"}
                  </button>
                </form>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/teacher/lessons/${lesson.id}/edit`}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit lesson"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <form action={deleteLesson}>
                    <input type="hidden" name="id" value={lesson.id} />
                    <button
                      type="submit"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
