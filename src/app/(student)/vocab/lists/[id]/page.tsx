import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function VocabListPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "student") {
    redirect("/login");
  }

  const listId = parseInt(params.id, 10);
  if (isNaN(listId)) {
    redirect("/vocab");
  }

  const list = await prisma.vocabList.findUnique({
    where: { id: listId },
    include: {
      cards: {
        include: {
          progress: true
        }
      }
    }
  });

  if (!list) {
    redirect("/vocab");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/vocab" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Lists
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{list.topic}</h1>
        {list.description && (
          <p className="text-slate-600 max-w-2xl">{list.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.cards.map(card => {
          const interval = card.progress?.interval ?? -1;
          let borderClass = "border-slate-200";
          let badgeClass = "bg-slate-100 text-slate-600";
          let statusText = "New";

          if (interval >= 21) {
            borderClass = "border-emerald-400";
            badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
            statusText = "Mastered";
          } else if (interval >= 7) {
            borderClass = "border-blue-400";
            badgeClass = "bg-blue-50 text-blue-700 border border-blue-200";
            statusText = "Familiar";
          } else if (interval >= 0) {
            borderClass = "border-amber-400";
            badgeClass = "bg-amber-50 text-amber-700 border border-amber-200";
            statusText = "Learning";
          }

          return (
            <div key={card.id} className={cn("bg-white rounded-xl shadow-sm border-2 p-6 flex flex-col", borderClass)}>
              <div className="flex items-start justify-between mb-4 gap-2">
                <h3 className="text-xl font-bold text-slate-900 break-words">{card.word}</h3>
                <span className={cn("text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap", badgeClass)}>
                  {statusText}
                </span>
              </div>
              <p className="text-slate-700 font-medium mb-4 flex-1">
                {card.definition}
              </p>
              {card.exampleSentence && (
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 italic">
                    "{card.exampleSentence}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {list.cards.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
          <p className="text-slate-500">This list has no words yet.</p>
        </div>
      )}
    </div>
  );
}
