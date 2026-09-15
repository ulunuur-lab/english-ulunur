import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, ClipboardList, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  submitted: "bg-violet-100 text-violet-700",
  reviewed: "bg-emerald-100 text-emerald-700",
};

const statusLabels: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  submitted: "Submitted",
  reviewed: "Reviewed",
};

export default async function TeacherHomework({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const homework = await prisma.homework.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: true },
  });

  const statuses = ["assigned", "in_progress", "submitted", "reviewed"];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Homework</h1>
          <p className="text-slate-500 mt-1">
            Assign and review homework tasks
          </p>
        </div>
        <Link
          href="/teacher/homework/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Homework
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Link
          href="/teacher/homework"
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            !status
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          )}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/teacher/homework?status=${s}`}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              status === s
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      {/* Homework List */}
      {homework.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            No homework found
          </h3>
          <p className="text-slate-500 mt-2">
            {status
              ? `No homework with status "${statusLabels[status]}".`
              : "Create your first homework assignment."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {homework.map((hw) => (
            <div
              key={hw.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {hw.title}
                    </h3>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 text-xs font-medium rounded-full whitespace-nowrap",
                        statusStyles[hw.status] ||
                          "bg-slate-100 text-slate-600"
                      )}
                    >
                      {statusLabels[hw.status] || hw.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="capitalize">{hw.type.replace("_", " ")}</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Due {format(new Date(hw.dueDate), "MMM d, yyyy")}
                    </span>
                    {hw.score !== null && (
                      <span
                        className={cn(
                          "font-semibold",
                          hw.score >= 70
                            ? "text-emerald-600"
                            : hw.score >= 50
                            ? "text-amber-600"
                            : "text-red-500"
                        )}
                      >
                        Score: {hw.score}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hw.status === "submitted" ? (
                    <Link
                      href={`/teacher/homework/${hw.id}/review`}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors"
                    >
                      Review
                    </Link>
                  ) : hw.status === "reviewed" ? (
                    <Link
                      href={`/teacher/homework/${hw.id}/review`}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      View Review
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
