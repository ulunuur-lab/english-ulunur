"use client";

import { useState } from "react";
import { DIAGNOSTIC_30_QUESTIONS } from "@/lib/diagnostic-questions";
import { submitDiagnosticCheck, type DiagnosticResult } from "./diagnostic-actions";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Trophy,
  RotateCcw,
  ShieldAlert,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DiagnosticLanding() {
  const [studentName, setStudentName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const cleanName = studentName.trim();
  const isTeacherTest = cleanName.toLowerCase() === "ulunur";

  const currentQ = DIAGNOSTIC_30_QUESTIONS[currentIndex];
  const selectedAnswer = answers[currentQ?.id];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanName) return;
    setIsStarted(true);
  };

  const handleSelectOption = (opt: string) => {
    setAnswers({ ...answers, [currentQ.id]: opt });
  };

  const handleNext = async () => {
    if (currentIndex < DIAGNOSTIC_30_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        const res = await submitDiagnosticCheck(cleanName, answers);
        setResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
              UE
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-wide">Ulunur&apos;s English</h1>
              <p className="text-[11px] text-slate-400">Intensive B1 → B2+ Diagnostic</p>
            </div>
          </div>

          {isTeacherTest && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Teacher Test Mode (Silent)
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-2xl w-full">
          {/* STEP 1: Name Input & Start Screen */}
          {!isStarted && !result && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 backdrop-blur-sm animate-fade-in text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <GraduationCap className="w-10 h-10" />
              </div>

              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Placement & Rust Assessment
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  English Level Check
                </h2>
                <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  Have a 5-month break from English? This 30-question diagnostic pinpoints exactly what you remember, where the rust is, and your personalized starting point towards solid B2+.
                </p>
              </div>

              <form onSubmit={handleStart} className="space-y-5 max-w-md mx-auto text-left">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    What is your name?
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white placeholder:text-slate-500 outline-none text-base transition-all font-medium"
                  />
                  {isTeacherTest && (
                    <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Welcome Ulunur! Telegram notifications will be muted during your test.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                  Start Level Check (30 Questions)
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="pt-4 border-t border-slate-700/50 flex items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">⏱️ ~15 minutes</span>
                <span className="flex items-center gap-1.5">🎯 30 Questions</span>
                <span className="flex items-center gap-1.5">📊 Immediate CEFR Level</span>
              </div>
            </div>
          )}

          {/* STEP 2: In-Progress Question Flow */}
          {isStarted && !result && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in">
              {/* Progress Header */}
              <div className="p-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                    {currentQ.tierName} • #{currentIndex + 1} OF {DIAGNOSTIC_30_QUESTIONS.length}
                  </span>
                  <span className="text-xs text-slate-400">{currentQ.topic}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-300">
                    {Math.round(((currentIndex + 1) / DIAGNOSTIC_30_QUESTIONS.length) * 100)}%
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-800 h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / DIAGNOSTIC_30_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question Text & Options */}
              <div className="p-6 md:p-10 space-y-6 flex-1">
                <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h3>

                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className={cn(
                          "w-full text-left p-4 md:p-5 rounded-2xl border text-sm md:text-base font-medium transition-all flex items-center justify-between gap-3",
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30"
                            : "bg-slate-900/60 border-slate-700/80 hover:border-slate-600 text-slate-300 hover:bg-slate-900"
                        )}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-semibold disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedAnswer || isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    "Analyzing..."
                  ) : currentIndex < DIAGNOSTIC_30_QUESTIONS.length - 1 ? (
                    <>
                      Next <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>Finish Assessment 🏁</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Results Screen */}
          {result && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 animate-fade-in text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Trophy className="w-10 h-10" />
              </div>

              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  Assessment Complete, {studentName}!
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">Your CEFR Benchmark</h2>
                <div className="text-4xl md:text-5xl font-black text-indigo-400 tracking-tight mt-2">
                  {result.level}
                </div>
                <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto leading-relaxed pt-2">
                  {result.summary}
                </p>
              </div>

              {/* Total Score Gauge */}
              <div className="inline-flex items-center gap-6 bg-slate-900/80 border border-slate-700/80 rounded-2xl px-6 py-4">
                <div>
                  <span className="text-2xl font-black text-white">{result.score} / 30</span>
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">Raw Score</span>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div>
                  <span className="text-2xl font-black text-indigo-400">{result.percentage}%</span>
                  <span className="text-[11px] text-slate-400 font-semibold block uppercase">Accuracy</span>
                </div>
              </div>

              {/* Tier Performance Breakdown */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-left space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Performance by Competency Tier
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">1. Foundations (A2/B1)</span>
                      <span className="text-indigo-400">{result.tierScores.tier1.score}/10</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${(result.tierScores.tier1.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">2. Core B1 Skills</span>
                      <span className="text-indigo-400">{result.tierScores.tier2.score}/10</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${(result.tierScores.tier2.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">3. B1+ / B2 Gateway Structures</span>
                      <span className="text-indigo-400">{result.tierScores.tier3.score}/10</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${(result.tierScores.tier3.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="text-left bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-indigo-400" /> Next Learning Steps
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Telegram Confirmation / Teacher Notice */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                {result.isTeacherTest ? (
                  <span className="text-amber-400 font-semibold">
                    🛡️ Teacher Mode Active: Silent test completed without Telegram notification.
                  </span>
                ) : (
                  <span>
                    ✅ Your teacher has received your diagnostic report on Telegram and will prepare your custom lesson plan!
                  </span>
                )}
              </div>

              {/* Retake Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setIsStarted(false);
                    setCurrentIndex(0);
                    setAnswers({});
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Start Over / Retake
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Ulunur&apos;s English • High-Performance 1-on-1 Language Intensive
      </footer>
    </div>
  );
}
