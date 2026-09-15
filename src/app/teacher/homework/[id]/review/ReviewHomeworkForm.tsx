"use client";

import { reviewHomework } from "../../actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Send, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReviewHomeworkFormProps {
  homework: {
    id: number;
    title: string;
    instructions: string;
    type: string;
    status: string;
    studentResponse: string | null;
    fileUrl: string | null;
    teacherFeedback: string | null;
    score: number | null;
    studentName: string;
  };
}

export default function ReviewHomeworkForm({
  homework,
}: ReviewHomeworkFormProps) {
  const isReviewed = homework.status === "reviewed";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/homework"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isReviewed ? "Review Details" : "Review Homework"}
          </h1>
          <p className="text-slate-500 mt-1">{homework.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Homework Details & Student Response */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Instructions
            </h2>
            <div className="prose prose-slate prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {homework.instructions}
              </ReactMarkdown>
            </div>
          </div>

          {/* Student Submission */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Student Submission — {homework.studentName}
            </h2>
            {homework.studentResponse ? (
              <div className="prose prose-slate prose-sm max-w-none bg-slate-50 rounded-xl p-4 border border-slate-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {homework.studentResponse}
                </ReactMarkdown>
              </div>
            ) : homework.fileUrl ? (
              <a
                href={homework.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                View Uploaded File
              </a>
            ) : (
              <p className="text-slate-400 italic">
                No submission yet from the student.
              </p>
            )}
          </div>
        </div>

        {/* Right: Review Form */}
        <div>
          {isReviewed ? (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 space-y-6">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  Review Complete
                </h2>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">
                  Score
                </p>
                <p
                  className={cn(
                    "text-4xl font-bold",
                    (homework.score ?? 0) >= 70
                      ? "text-emerald-600"
                      : (homework.score ?? 0) >= 50
                      ? "text-amber-600"
                      : "text-red-500"
                  )}
                >
                  {homework.score}
                  <span className="text-lg text-slate-400">/100</span>
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 mb-2">
                  Feedback
                </p>
                <div className="bg-slate-50 rounded-xl p-4 text-slate-700 text-sm leading-relaxed">
                  {homework.teacherFeedback}
                </div>
              </div>
            </div>
          ) : (
            <form
              action={reviewHomework}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6"
            >
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Your Review
              </h2>

              <input type="hidden" name="id" value={homework.id} />

              {/* Score */}
              <div>
                <label
                  htmlFor="score"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Score (0–100)
                </label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  required
                  min={0}
                  max={100}
                  placeholder="85"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Feedback */}
              <div>
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  required
                  rows={8}
                  placeholder="Provide detailed feedback on the student's work..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm resize-y"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
