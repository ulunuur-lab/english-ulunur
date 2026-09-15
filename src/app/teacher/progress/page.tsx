import { prisma } from "@/lib/db";
import { updateProgress } from "./actions";
import {
  BookOpen,
  Pencil,
  Headphones,
  MessageCircle,
  Languages,
  Brain,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SKILLS = [
  { key: "reading", label: "Reading", icon: BookOpen, color: "bg-emerald-100 text-emerald-600" },
  { key: "writing", label: "Writing", icon: Pencil, color: "bg-rose-100 text-rose-600" },
  { key: "listening", label: "Listening", icon: Headphones, color: "bg-amber-100 text-amber-600" },
  { key: "speaking", label: "Speaking", icon: MessageCircle, color: "bg-cyan-100 text-cyan-600" },
  { key: "grammar", label: "Grammar", icon: Languages, color: "bg-blue-100 text-blue-600" },
  { key: "vocabulary", label: "Vocabulary", icon: Brain, color: "bg-violet-100 text-violet-600" },
];

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getCEFRLevel(score: number) {
  if (score >= 90) return "C1";
  if (score >= 75) return "B2";
  if (score >= 60) return "B1";
  if (score >= 40) return "A2";
  if (score >= 20) return "A1";
  return "Pre-A1";
}

export default async function TeacherProgress() {
  const student = await prisma.user.findFirst({
    where: { role: "student" },
  });

  const progressRecords = student
    ? await prisma.progress.findMany({
        where: { userId: student.id },
      })
    : [];

  const progressMap: Record<string, number> = {};
  for (const p of progressRecords) {
    progressMap[p.skill] = p.score;
  }

  const avgScore =
    progressRecords.length > 0
      ? Math.round(
          progressRecords.reduce((sum, p) => sum + p.score, 0) /
            progressRecords.length
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Student Progress
        </h1>
        <p className="text-slate-500 mt-1">
          {student
            ? `Adjust ${student.name}'s CEFR skill scores`
            : "No student enrolled"}
        </p>
      </div>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">
              Overall CEFR Level
            </p>
            <div className="flex items-baseline gap-4 mt-2">
              <span className="text-5xl font-bold">{getCEFRLevel(avgScore)}</span>
              <span className="text-2xl text-indigo-200">
                ({avgScore}/100)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-sm">Target Level</p>
            <p className="text-3xl font-bold mt-1">B2</p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${avgScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-indigo-200 mt-2">
            <span>A1</span>
            <span>A2</span>
            <span>B1</span>
            <span>B2</span>
            <span>C1</span>
          </div>
        </div>
      </div>

      {/* Skills Form */}
      <form action={updateProgress}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">
              Skill Scores
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Adjust each skill score from 0 to 100
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {SKILLS.map((skill) => {
              const score = progressMap[skill.key] ?? 0;
              const Icon = skill.icon;
              return (
                <div
                  key={skill.key}
                  className="flex items-center gap-6 px-6 py-5"
                >
                  {/* Skill Icon & Label */}
                  <div className="flex items-center gap-4 w-48 flex-shrink-0">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        skill.color
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {skill.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {getCEFRLevel(score)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          score >= 75
                            ? "bg-emerald-500"
                            : score >= 50
                            ? "bg-amber-500"
                            : score >= 25
                            ? "bg-orange-500"
                            : "bg-red-400"
                        )}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Score Input */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      name={skill.key}
                      defaultValue={score}
                      min={0}
                      max={100}
                      className={cn(
                        "w-20 px-3 py-2 rounded-xl border border-slate-200 text-center font-semibold text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all",
                        getScoreColor(score)
                      )}
                    />
                    <span className="text-sm text-slate-400">/100</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
