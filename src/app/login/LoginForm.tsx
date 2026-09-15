"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");

  const fillCredentials = (email: string, pass: string) => {
    setEmailVal(email);
    setPasswordVal(pass);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={passwordVal}
            onChange={(e) => setPasswordVal(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Quick 1-Click Fill Helpers */}
      <div className="pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2 text-center">
          ⚡ 1-Click Demo Login
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => fillCredentials("teacher@ulunurs.english", "teacher123")}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 transition-colors text-center"
          >
            👩‍🏫 Fill Teacher
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("student@ulunurs.english", "student123")}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-violet-200 bg-violet-50/60 hover:bg-violet-100 text-violet-700 transition-colors text-center"
          >
            👩‍🎓 Fill Student
          </button>
        </div>
      </div>
    </div>
  );
}
