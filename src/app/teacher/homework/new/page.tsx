"use client";

import { createHomework } from "../actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

const types = [
  { value: "written", label: "Written Response" },
  { value: "fill_blank", label: "Fill in the Blanks" },
  { value: "upload", label: "File Upload" },
];

export default function CreateHomeworkPage() {
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
            Create Homework
          </h1>
          <p className="text-slate-500 mt-1">
            Assign a new homework task to your student
          </p>
        </div>
      </div>

      <form action={createHomework} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g. Write a formal letter"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Homework Type
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 bg-white"
            >
              <option value="">Select type...</option>
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900"
            />
          </div>

          {/* Instructions */}
          <div>
            <label
              htmlFor="instructions"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Instructions (Markdown)
            </label>
            <textarea
              id="instructions"
              name="instructions"
              required
              rows={10}
              placeholder="Write detailed instructions for the homework task..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-mono text-sm resize-y"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Save className="w-5 h-5" />
            Assign Homework
          </button>
        </div>
      </form>
    </div>
  );
}
