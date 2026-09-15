import { prisma } from "@/lib/db";
import {
  BookOpen,
  ClipboardList,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  Star,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const actionIcons: Record<string, typeof BookOpen> = {
  lesson_completed: BookOpen,
  homework_submitted: ClipboardList,
  vocab_reviewed: Brain,
  test_completed: FileText,
};

const actionColors: Record<string, string> = {
  lesson_completed: "bg-emerald-100 text-emerald-600",
  homework_submitted: "bg-violet-100 text-violet-600",
  vocab_reviewed: "bg-amber-100 text-amber-600",
  test_completed: "bg-blue-100 text-blue-600",
};

export default async function TeacherOverview() {
  const student = await prisma.user.findFirst({
    where: { role: "student" },
  });

  // B2 Readiness Score — average of all Progress scores
  const progressRecords = await prisma.progress.findMany({
    where: student ? { userId: student.id } : undefined,
  });
  const avgScore =
    progressRecords.length > 0
      ? Math.round(
          progressRecords.reduce((sum, p) => sum + p.score, 0) /
            progressRecords.length
        )
      : 0;

  // Quick stats
  const [lessonCount, pendingHomework, vocabListCount] = await Promise.all([
    prisma.lesson.count(),
    prisma.homework.count({
      where: { status: "submitted" },
    }),
    prisma.vocabList.count(),
  ]);

  // Recent student activity
  const recentActivity = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Pending homework submissions
  const pendingSubmissions = await prisma.homework.findMany({
    where: { status: "submitted" },
    orderBy: { updatedAt: "desc" },
    include: { assignedTo: true },
  });

  const getReadinessColor = (score: number) => {
    if (score >= 75) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-500";
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return "On Track";
    if (score >= 60) return "Progressing";
    if (score >= 40) return "Needs Work";
    return "Getting Started";
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Teacher Overview</h1>
        <p className="text-slate-500 mt-1">
          {student
            ? `Tracking ${student.name}'s B2 readiness`
            : "No student enrolled yet"}
        </p>
      </div>

      {/* B2 Readiness Score Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">
              B2 Readiness Score
            </p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-6xl font-bold">{avgScore}</span>
              <span className="text-2xl text-indigo-200">/100</span>
            </div>
            <p className="mt-2 text-indigo-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {getReadinessLabel(avgScore)}
            </p>
          </div>
          <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
            <Star className="w-12 h-12 text-amber-300" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{lessonCount}</p>
              <p className="text-sm text-slate-500">Lessons Created</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {pendingHomework}
              </p>
              <p className="text-sm text-slate-500">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Brain className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {vocabListCount}
              </p>
              <p className="text-sm text-slate-500">Vocab Lists</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Submissions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Pending Submissions
              </h2>
              <Link
                href="/teacher/homework"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm mt-1">No submissions to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSubmissions.map((hw) => (
                  <Link
                    key={hw.id}
                    href={`/teacher/homework/${hw.id}/review`}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-slate-900 group-hover:text-indigo-700">
                        {hw.title}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Due{" "}
                        {formatDistanceToNow(new Date(hw.dueDate), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Needs Review
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p className="font-medium">No activity yet</p>
                <p className="text-sm mt-1">
                  Student activity will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((activity, index) => {
                  const IconComponent =
                    actionIcons[activity.action] || FileText;
                  const colorClass =
                    actionColors[activity.action] ||
                    "bg-slate-100 text-slate-600";
                  const details = activity.details
                    ? JSON.parse(activity.details)
                    : {};

                  return (
                    <div
                      key={activity.id}
                      className="flex gap-4 py-3 relative"
                    >
                      {/* Timeline line */}
                      {index < recentActivity.length - 1 && (
                        <div className="absolute left-[18px] top-[44px] w-0.5 h-[calc(100%-20px)] bg-slate-100" />
                      )}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        {details.title && (
                          <p className="text-sm text-slate-500 truncate">
                            {details.title}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
