"use client";

import { createVocabList } from "../actions";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateVocabListPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/teacher/vocab"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Create Vocabulary List
          </h1>
          <p className="text-slate-500 mt-1">
            Add a new topic for vocabulary study
          </p>
        </div>
      </div>

      <form action={createVocabList} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
          {/* Topic */}
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Topic Name
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              required
              placeholder="e.g. Business English, Travel Vocabulary"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Description{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Brief description of this vocabulary list..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm resize-y"
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
            Create & Add Cards
          </button>
        </div>
      </form>
    </div>
  );
}
