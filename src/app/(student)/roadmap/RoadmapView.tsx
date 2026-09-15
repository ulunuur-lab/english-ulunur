"use client";

import { useState } from "react";
import { Lock, Play, CheckCircle, Trophy, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import InteractiveQuizModal from "./InteractiveQuizModal";
import { useRouter } from "next/navigation";

interface Topic {
  id: number;
  world: number;
  orderIndex: number;
  title: string;
  description: string;
  skill: string;
  isBoss: boolean;
  quizData: string | null;
  status: "locked" | "unlocked" | "completed";
  score: number | null;
}

interface RoadmapViewProps {
  topics: Topic[];
  studentName: string;
}

const WORLDS = [
  { id: 1, name: "World 1: Narrative & Past Consolidation", target: "B1 → B1+", bg: "from-blue-600 to-indigo-600" },
  { id: 2, name: "World 2: Hypotheticals & The Art of Speculation", target: "B1+ → B2 Entry", bg: "from-indigo-600 to-violet-600" },
  { id: 3, name: "World 3: Objectivity & Academic Impersonality", target: "B2 Core", bg: "from-violet-600 to-purple-600" },
  { id: 4, name: "World 4: Nuance, Emphasis & Complex Structures", target: "Solid B2", bg: "from-purple-600 to-pink-600" },
  { id: 5, name: "World 5: Exam Transformation & Fluency Mastery", target: "B2+ Destination 🏁", bg: "from-pink-600 to-rose-600" },
];

export default function RoadmapView({ topics, studentName }: RoadmapViewProps) {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const completedCount = topics.filter((t) => t.status === "completed").length;
  const overallPercentage = Math.round((completedCount / topics.length) * 100);

  const handleStartQuest = (topic: Topic) => {
    if (topic.status === "locked") return;
    setSelectedTopic(topic);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-indigo-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              CEFR B1 → B2+ EXAM ROADMAP
            </div>
            <h1 className="text-3xl font-bold tracking-tight">The Quest to B2+ Fluency</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
              Clear all 60 video game style milestones across 5 Worlds to achieve solid CEFR B2+ readiness for the official exam.
            </p>
          </div>

          {/* Overall Progress Gauge */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-5 min-w-[240px]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
              {overallPercentage}%
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Progress
              </span>
              <span className="text-sm font-bold text-white">
                {completedCount} / {topics.length} Quests
              </span>
              <span className="text-xs text-emerald-400 block mt-0.5 font-medium">
                {60 - completedCount} quests to Exam Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Worlds */}
      <div className="space-y-12">
        {WORLDS.map((world) => {
          const worldTopics = topics.filter((t) => t.world === world.id);
          const worldCompleted = worldTopics.filter((t) => t.status === "completed").length;

          return (
            <div key={world.id} className="space-y-5">
              {/* World Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>{world.name}</span>
                  </h2>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    Target: {world.target}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  {worldCompleted} / {worldTopics.length} Cleared
                </div>
              </div>

              {/* Grid of Quests */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {worldTopics.map((topic) => {
                  const isLocked = topic.status === "locked";
                  const isCompleted = topic.status === "completed";
                  const isAvailable = topic.status === "unlocked";

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleStartQuest(topic)}
                      disabled={isLocked}
                      className={cn(
                        "text-left p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between group",
                        isCompleted
                          ? "bg-white border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md"
                          : isAvailable
                          ? "bg-white border-indigo-200 hover:border-indigo-400 shadow-sm hover:shadow-lg hover:-translate-y-0.5 ring-2 ring-indigo-500/10"
                          : "bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed"
                      )}
                    >
                      {/* Top Row: Quest Number & Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={cn(
                            "w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center",
                            isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : isAvailable
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-200 text-slate-500"
                          )}
                        >
                          #{topic.orderIndex}
                        </span>

                        {topic.isBoss && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> BOSS
                          </span>
                        )}

                        {isCompleted && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle className="w-4 h-4" /> {topic.score ? `${topic.score}%` : "Passed"}
                          </span>
                        )}
                        {isAvailable && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 animate-pulse">
                            <Play className="w-3.5 h-3.5 fill-indigo-600" /> Start
                          </span>
                        )}
                        {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                      </div>

                      {/* Content */}
                      <div>
                        <h3
                          className={cn(
                            "font-bold text-sm leading-snug mb-1 transition-colors",
                            isLocked
                              ? "text-slate-500"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-900 group-hover:text-indigo-600"
                          )}
                        >
                          {topic.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      {/* Bottom Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                        <span className="capitalize">{topic.skill}</span>
                        {isAvailable && (
                          <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                            Play Quiz <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Modal when active */}
      {selectedTopic && (
        <InteractiveQuizModal
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onCompleted={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
