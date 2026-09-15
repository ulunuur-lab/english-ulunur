import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Brain, BookOpen } from "lucide-react";

export default async function TeacherVocab() {
  const vocabLists = await prisma.vocabList.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { cards: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vocabulary</h1>
          <p className="text-slate-500 mt-1">
            Manage vocabulary lists and flashcards
          </p>
        </div>
        <Link
          href="/teacher/vocab/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create List
        </Link>
      </div>

      {/* Vocab Lists Grid */}
      {vocabLists.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <Brain className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            No vocabulary lists yet
          </h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Create your first vocabulary list with flashcards for your student.
          </p>
          <Link
            href="/teacher/vocab/new"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First List
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vocabLists.map((list) => (
            <Link
              key={list.id}
              href={`/teacher/vocab/${list.id}/edit`}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-violet-600" />
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                  {list._count.cards} {list._count.cards === 1 ? "card" : "cards"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-4 group-hover:text-indigo-700 transition-colors">
                {list.topic}
              </h3>
              {list.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {list.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
