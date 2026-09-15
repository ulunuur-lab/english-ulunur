import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SkillRadarChart from "@/components/SkillRadarChart";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_SKILLS = ["reading", "writing", "listening", "speaking", "grammar", "vocabulary"];

export default async function ProgressPage() {
  const session = await requireAuth("student");
  
  const [progress, streak] = await Promise.all([
    prisma.progress.findMany({ where: { userId: session.userId } }),
    prisma.streak.findUnique({ where: { userId: session.userId } })
  ]);

  // Merge with defaults if some skills are missing
  const progressMap = new Map(progress.map(p => [p.skill, p.score]));
  const chartData = ALL_SKILLS.map(skill => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    score: progressMap.get(skill) || 0
  }));

  const b2ReadinessScore = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, p) => acc + p.score, 0) / 6)
    : 0;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>
        <p className="text-slate-500 mt-2">Track your journey to B2</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Skill Profile</h2>
            <SkillRadarChart data={chartData} />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Detailed Scores</h2>
            <div className="space-y-6">
              {chartData.map(item => (
                <div key={item.skill}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-slate-700">{item.skill}</span>
                    <span className="text-sm font-bold text-indigo-600">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div 
                      className="bg-indigo-500 h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-600 p-8 rounded-3xl shadow-md text-white text-center">
            <h2 className="text-indigo-100 font-medium mb-4">B2 Readiness Score</h2>
            <div className="text-6xl font-black mb-2">{b2ReadinessScore}%</div>
            <p className="text-sm text-indigo-200">
              {b2ReadinessScore >= 80 ? "You're almost there! Keep it up!" :
               b2ReadinessScore >= 50 ? "Making solid progress." :
               "Every lesson counts. Keep going!"}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-500 mb-4">
              <Flame size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Current Streak</h3>
            <div className="text-3xl font-black text-rose-500 mb-2">{streak?.currentStreak || 0} Days</div>
            <p className="text-sm text-slate-500">Longest streak: {streak?.longestStreak || 0}</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-500 mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Total XP</h3>
            <div className="text-3xl font-black text-amber-500 mb-2">
              {/* Calculating dummy XP based on lessons and vocab */}
              {((streak?.longestStreak || 0) * 10) + (b2ReadinessScore * 5)} 
            </div>
            <p className="text-sm text-slate-500">Keep earning to level up!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
