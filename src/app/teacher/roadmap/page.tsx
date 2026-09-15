import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toggleTopicLock, unlockWorld } from "./actions";
import { Lock, Unlock, CheckCircle, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function TeacherRoadmapPage() {
  await requireAuth("teacher");

  const student = await prisma.user.findFirst({ where: { role: "student" } });
  const topics = await prisma.roadmapTopic.findMany({ orderBy: { orderIndex: "asc" } });

  const studentProgress = student
    ? await prisma.userTopicProgress.findMany({ where: { userId: student.id } })
    : [];

  const progressMap = new Map<number, { status: string; score: number | null }>();
  studentProgress.forEach((p) => {
    progressMap.set(p.topicId, { status: p.status, score: p.score });
  });

  const worlds = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Roadmap Control Room</h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor and manually unlock or lock the 60 video game style quests for your student ({student?.name || "Student"}).
          </p>
        </div>
      </div>

      {/* World Management */}
      <div className="space-y-8">
        {worlds.map((worldId) => {
          const worldTopics = topics.filter((t) => t.world === worldId);

          return (
            <div key={worldId} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">STAGE {worldId}</span>
                  <h2 className="text-xl font-bold text-slate-900">World {worldId} Quests</h2>
                </div>
                <form action={unlockWorld.bind(null, worldId)}>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Unlock All in World {worldId}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {worldTopics.map((topic) => {
                  const p = progressMap.get(topic.id);
                  const status = p?.status || (topic.id === 1 ? "unlocked" : "locked");
                  const isCompleted = status === "completed";
                  const isUnlocked = status === "unlocked";
                  const isLocked = status === "locked";

                  return (
                    <div
                      key={topic.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex items-center justify-between gap-3",
                        isCompleted
                          ? "bg-emerald-50/40 border-emerald-200"
                          : isUnlocked
                          ? "bg-white border-indigo-200 shadow-sm"
                          : "bg-slate-50 border-slate-200 opacity-70"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-slate-400">#{topic.orderIndex}</span>
                          {topic.isBoss && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 rounded uppercase">
                              Boss
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-semibold text-slate-400 capitalize">
                            {topic.skill}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate">{topic.title}</h4>
                        {isCompleted && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3" /> Passed ({p?.score || 100}%)
                          </span>
                        )}
                      </div>

                      <form action={toggleTopicLock.bind(null, topic.id, status)}>
                        <button
                          type="submit"
                          title={isLocked ? "Click to unlock" : "Click to lock"}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            isLocked
                              ? "bg-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white"
                              : "bg-indigo-100 text-indigo-700 hover:bg-red-100 hover:text-red-700"
                          )}
                        >
                          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </form>
                    </div>
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
