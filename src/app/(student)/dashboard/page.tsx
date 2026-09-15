import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { format, endOfDay } from "date-fns";
import { BookOpen, PenTool, Brain, Flame, Activity, Map, Award, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireAuth("student");
  const userId = session.userId;

  const [
    progress,
    streak,
    pendingHomework,
    completedLessonsCount,
    totalLessonsCount,
    masteredVocabCount,
    recentActivity,
    allPublishedLessons,
    vocabCards,
    userTopicProgress,
    allTopics,
    lastLevelCheck,
  ] = await Promise.all([
    prisma.progress.findMany({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.homework.findMany({ 
      where: { 
        assignedToId: userId,
        status: { in: ["assigned", "in_progress"] },
        dueDate: { lte: endOfDay(new Date()) }
      } 
    }),
    prisma.lessonProgress.count({ where: { userId, isCompleted: true } }),
    prisma.lesson.count({ where: { isPublished: true } }),
    prisma.vocabProgress.count({ where: { interval: { gte: 21 } } }),
    prisma.activityLog.findMany({ 
      where: { userId }, 
      orderBy: { createdAt: 'desc' }, 
      take: 5 
    }),
    prisma.lesson.findMany({ 
      where: { isPublished: true },
      include: { progress: { where: { userId } } }
    }),
    prisma.vocabCard.findMany({
      include: { progress: true }
    }),
    prisma.userTopicProgress.findMany({ where: { userId } }),
    prisma.roadmapTopic.findMany({ orderBy: { orderIndex: 'asc' } }),
    prisma.levelCheck.findFirst({ where: { userId }, orderBy: { completedAt: 'desc' } }),
  ]);

  const b2ReadinessScore = progress.length > 0 
    ? Math.round(progress.reduce((acc, p) => acc + p.score, 0) / 6)
    : 0;

  const incompleteLessons = allPublishedLessons.filter(l => l.progress.length === 0 || !l.progress[0].isCompleted);
  const now = new Date();
  const dueVocab = vocabCards.filter(c => !c.progress || c.progress.nextReview <= now);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {session.name}!</h1>
          <p className="text-slate-500 mt-1">{format(now, "EEEE, MMMM do")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h2 className="text-sm font-medium text-slate-500 mb-4">B2 Readiness</h2>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              <circle 
                className="text-indigo-600" 
                strokeWidth="8" 
                strokeDasharray={251.2} 
                strokeDashoffset={251.2 - (251.2 * b2ReadinessScore) / 100} 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="40" cx="50" cy="50" 
              />
            </svg>
            <div className="absolute text-2xl font-bold text-slate-900">{b2ReadinessScore}%</div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-indigo-600 mb-2">
              <BookOpen size={20} />
              <span className="font-semibold">Lessons</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{completedLessonsCount} <span className="text-sm text-slate-400 font-normal">/ {totalLessonsCount}</span></div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-amber-500 mb-2">
              <PenTool size={20} />
              <span className="font-semibold">Homework</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{pendingHomework.length} <span className="text-sm text-slate-400 font-normal">pending</span></div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-purple-500 mb-2">
              <Brain size={20} />
              <span className="font-semibold">Vocab</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{masteredVocabCount} <span className="text-sm text-slate-400 font-normal">mastered</span></div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center space-x-2 text-rose-500 mb-2">
              <Flame size={20} />
              <span className="font-semibold">Streak</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{streak?.currentStreak || 0} <span className="text-sm text-slate-400 font-normal">days</span></div>
          </div>
        </div>
      </div>

      {/* Quest Roadmap Banner */}
      {(() => {
        // Find current active quest
        const completedIds = new Set(userTopicProgress.filter(p => p.status === "completed").map(p => p.topicId));
        const activeTopic = allTopics.find(t => !completedIds.has(t.id)) || allTopics[0];
        const completedCount = completedIds.size;

        return (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-indigo-100">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Map className="w-3.5 h-3.5" /> Current Quest: #{activeTopic?.orderIndex || 1}
                </span>
                <span className="text-xs text-indigo-300 font-medium">World {activeTopic?.world || 1}</span>
              </div>
              <h3 className="text-xl font-bold">{activeTopic?.title}</h3>
              <p className="text-xs text-indigo-200 max-w-xl line-clamp-1">{activeTopic?.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <span className="text-xs text-indigo-300 block font-semibold">Roadmap Progress</span>
                <span className="text-base font-bold text-white">{completedCount} / 60 Quests</span>
              </div>
              <Link
                href="/roadmap"
                className="px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-2xl text-sm shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Resume Quest <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Activity className="mr-2 text-indigo-600" size={20} />
              Today's Tasks
            </h2>
            <Link href="/level-check" className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Level Check
            </Link>
          </div>
          <div className="space-y-4">
            {incompleteLessons.slice(0, 2).map(lesson => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="block p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition">
                <div className="text-sm font-medium text-indigo-600 mb-1 capitalize">{lesson.skill} Lesson</div>
                <div className="font-medium text-slate-900">{lesson.title}</div>
              </Link>
            ))}
            {pendingHomework.map(hw => (
              <Link key={hw.id} href={`/homework/${hw.id}`} className="block p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition">
                <div className="text-sm font-medium text-amber-600 mb-1">Homework Due Today</div>
                <div className="font-medium text-slate-900">{hw.title}</div>
              </Link>
            ))}
            {dueVocab.length > 0 && (
              <div className="p-4 rounded-xl bg-purple-50">
                <div className="text-sm font-medium text-purple-600 mb-1">Vocabulary</div>
                <div className="font-medium text-slate-900">{dueVocab.length} words to review</div>
              </div>
            )}
            {incompleteLessons.length === 0 && pendingHomework.length === 0 && dueVocab.length === 0 && (
              <div className="text-center text-slate-500 py-4">You're all caught up for today!</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-400"></div>
                <div>
                  <p className="text-slate-700 text-sm">{activity.action.replace(/_/g, ' ')}</p>
                  <span className="text-xs text-slate-400">{format(new Date(activity.createdAt), "MMM d, h:mm a")}</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center text-slate-500 py-4">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
