import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function VocabPage() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "student") {
    redirect("/login");
  }

  const now = new Date();

  // Get stats
  const totalWords = await prisma.vocabCard.count();
  
  const dueWords = await prisma.vocabCard.count({
    where: {
      OR: [
        { progress: null },
        { progress: { nextReview: { lte: now } } }
      ]
    }
  });

  const masteredWords = await prisma.vocabProgress.count({
    where: { interval: { gte: 21 } }
  });

  // Get all lists
  const lists = await prisma.vocabList.findMany({
    include: {
      _count: {
        select: { cards: true }
      },
      cards: {
        include: {
          progress: true
        }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Vocabulary</h1>
        <Link href="/vocab/review" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 shadow-sm w-full sm:w-auto">
          Review Now ({dueWords})
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold text-slate-900 mb-2">{totalWords}</span>
          <span className="text-slate-500 font-medium text-sm uppercase tracking-wider">Total Words</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-200 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold text-amber-600 mb-2">{dueWords}</span>
          <span className="text-amber-700 font-medium text-sm uppercase tracking-wider">Due Today</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold text-emerald-600 mb-2">{masteredWords}</span>
          <span className="text-emerald-700 font-medium text-sm uppercase tracking-wider">Mastered</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Lists</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map(list => {
          const masteredInList = list.cards.filter(c => c.progress && c.progress.interval >= 21).length;
          
          return (
            <Link key={list.id} href={`/vocab/lists/${list.id}`} className="group block">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full transition-all group-hover:shadow-md group-hover:border-indigo-300 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {list.topic}
                  </h3>
                  {list.description && (
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                      {list.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">
                    {list._count.cards} cards
                  </span>
                  <span className="text-emerald-600 font-medium">
                    {masteredInList} mastered
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
