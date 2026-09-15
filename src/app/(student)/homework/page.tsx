import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default async function HomeworkPage({ searchParams }: { searchParams: { filter?: string } }) {
  const session = await requireAuth("student");
  const filter = searchParams.filter || "all";

  const statusFilter = 
    filter === "pending" ? { in: ["assigned", "in_progress"] } :
    filter === "submitted" ? "submitted" :
    filter === "reviewed" ? "reviewed" :
    undefined;

  const homework = await prisma.homework.findMany({
    where: { 
      assignedToId: session.userId,
      ...(statusFilter && { status: statusFilter as any })
    },
    orderBy: { dueDate: 'asc' }
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Homework</h1>
          <p className="text-slate-500 mt-1">Manage your assignments</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
          {["all", "pending", "submitted", "reviewed"].map(f => (
            <Link 
              key={f} 
              href={`/homework?filter=${f}`}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md capitalize transition",
                filter === f ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {f}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homework.map(hw => {
          const isOverdue = (hw.status === "assigned" || hw.status === "in_progress") && isPast(new Date(hw.dueDate));
          return (
            <Link key={hw.id} href={`/homework/${hw.id}`} className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide bg-slate-100 text-slate-700">
                  {hw.type.replace('_', ' ')}
                </span>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
                  hw.status === "reviewed" ? "bg-emerald-100 text-emerald-700" :
                  hw.status === "submitted" ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                )}>
                  {hw.status === "reviewed" ? <CheckCircle2 size={14} /> :
                   hw.status === "submitted" ? <FileText size={14} /> :
                   <Clock size={14} />}
                  {hw.status.replace('_', ' ')}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{hw.title}</h3>
              
              <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-slate-50">
                <div className={cn("flex items-center font-medium", isOverdue ? "text-rose-600" : "text-slate-500")}>
                  {isOverdue && <AlertCircle size={16} className="mr-1" />}
                  Due: {format(new Date(hw.dueDate), "MMM d, yyyy")}
                </div>
                {hw.status === "reviewed" && hw.score !== null && (
                  <div className="font-bold text-indigo-700">
                    Score: {hw.score}/100
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {homework.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            No homework assignments found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
