"use client";

import { useState } from "react";
import { createLesson } from "../actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Save, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

const skills = [
  "grammar",
  "vocabulary",
  "reading",
  "listening",
  "writing",
  "speaking",
];

export default function CreateLessonPage() {
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/lessons"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Lesson</h1>
          <p className="text-slate-500 mt-1">
            Write lesson content in markdown
          </p>
        </div>
      </div>

      <form action={createLesson} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Lesson Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g. Present Perfect vs Past Simple"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Skill */}
          <div>
            <label
              htmlFor="skill"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Skill Category
            </label>
            <select
              id="skill"
              name="skill"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 bg-white"
            >
              <option value="">Select a skill...</option>
              {skills.map((skill) => (
                <option key={skill} value={skill} className="capitalize">
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-slate-700"
              >
                Content (Markdown)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Show Preview
                  </>
                )}
              </button>
            </div>
            <textarea
              id="content"
              name="content"
              required
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your lesson content in markdown..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-mono text-sm resize-y"
            />
          </div>

          {/* Markdown Preview */}
          {showPreview && content && (
            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
                Preview
              </p>
              <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Published */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
            />
            <label
              htmlFor="isPublished"
              className="text-sm font-medium text-slate-700"
            >
              Publish immediately (visible to student)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Save className="w-5 h-5" />
            Save Lesson
          </button>
        </div>
      </form>
    </div>
  );
}
