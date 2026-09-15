import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { addVocabCard, deleteVocabCard } from "../../actions";
import { ArrowLeft, Plus, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function EditVocabListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await prisma.vocabList.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      cards: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!list) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/vocab"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{list.topic}</h1>
          {list.description && (
            <p className="text-slate-500 mt-1">{list.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Card Form */}
        <div className="lg:col-span-1">
          <form action={addVocabCard}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 sticky top-8">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Card
              </h2>

              <input type="hidden" name="listId" value={list.id} />

              <div>
                <label
                  htmlFor="word"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Word / Phrase
                </label>
                <input
                  type="text"
                  id="word"
                  name="word"
                  required
                  placeholder="e.g. Nevertheless"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="definition"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Definition
                </label>
                <input
                  type="text"
                  id="definition"
                  name="definition"
                  required
                  placeholder="In spite of that; however"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="exampleSentence"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Example Sentence{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="exampleSentence"
                  name="exampleSentence"
                  rows={3}
                  placeholder="The weather was bad; nevertheless, we went hiking."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm resize-y"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </button>
            </div>
          </form>
        </div>

        {/* Cards List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Cards ({list.cards.length})
            </h2>
          </div>

          {list.cards.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="font-medium text-slate-900">No cards yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Use the form to add vocabulary cards
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.cards.map((card, index) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {card.word}
                        </h3>
                      </div>
                      <p className="text-slate-600 mt-1.5 text-sm">
                        {card.definition}
                      </p>
                      {card.exampleSentence && (
                        <p className="text-slate-400 text-sm mt-2 italic border-l-2 border-slate-200 pl-3">
                          &ldquo;{card.exampleSentence}&rdquo;
                        </p>
                      )}
                    </div>
                    <form action={deleteVocabCard}>
                      <input type="hidden" name="cardId" value={card.id} />
                      <input type="hidden" name="listId" value={list.id} />
                      <button
                        type="submit"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Delete card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
