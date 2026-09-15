"use client";

import { useState } from "react";
import { submitLevelCheck } from "./actions";
import { Award, CheckCircle, ChevronRight, Sparkles, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LevelCheckQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

const DIAGNOSTIC_QUESTIONS: LevelCheckQuestion[] = [
  {
    id: 1,
    question: "I ______ to Italy twice so far, but I'd love to visit again.",
    options: ["went", "have been", "am going", "had been"],
    correctAnswer: "have been",
    category: "Present Perfect vs Past Simple",
  },
  {
    id: 2,
    question: "While we ______ dinner, the electricity suddenly went out.",
    options: ["had", "were having", "have had", "had had"],
    correctAnswer: "were having",
    category: "Narrative Tenses",
  },
  {
    id: 3,
    question: "When I arrived at the station, the express train ______.",
    options: ["already left", "had already left", "has already left", "was leaving already"],
    correctAnswer: "had already left",
    category: "Past Perfect",
  },
  {
    id: 4,
    question: "If I ______ you, I would take the job offer immediately.",
    options: ["was", "am", "were", "would be"],
    correctAnswer: "were",
    category: "Second Conditional",
  },
  {
    id: 5,
    question: "If she ______ earlier, she wouldn't have missed the flight.",
    options: ["woke up", "had woken up", "would wake up", "wakes up"],
    correctAnswer: "had woken up",
    category: "Third Conditional",
  },
  {
    id: 6,
    question: "If I had accepted that transfer to Tokyo last year, I ______ in Japan right now.",
    options: ["would have lived", "would be living", "will live", "had lived"],
    correctAnswer: "would be living",
    category: "Mixed Conditionals",
  },
  {
    id: 7,
    question: "I really wish I ______ more attention during the physics lecture yesterday.",
    options: ["paid", "had paid", "would pay", "pay"],
    correctAnswer: "had paid",
    category: "Wishes & Regrets",
  },
  {
    id: 8,
    question: "The streets are soaking wet and there are large puddles. It ______ rained heavily.",
    options: ["must have", "can't have", "should have", "would have"],
    correctAnswer: "must have",
    category: "Past Modals of Deduction",
  },
  {
    id: 9,
    question: "The historic monument ______ by skilled artisans in 1850.",
    options: ["built", "was built", "has built", "was building"],
    correctAnswer: "was built",
    category: "Passive Voice",
  },
  {
    id: 10,
    question: "My car made a strange rattling sound, so I had it ______ by a mechanic.",
    options: ["inspect", "inspected", "inspecting", "to inspect"],
    correctAnswer: "inspected",
    category: "Causative Verbs",
  },
  {
    id: 11,
    question: "The suspect is believed ______ the country under a false identity.",
    options: ["to leave", "to have left", "leaving", "having left"],
    correctAnswer: "to have left",
    category: "Impersonal Passives",
  },
  {
    id: 12,
    question: "He stopped ______ a glass of water before continuing his presentation.",
    options: ["drinking", "to drink", "drink", "for drinking"],
    correctAnswer: "to drink",
    category: "Gerund vs Infinitive",
  },
  {
    id: 13,
    question: "______ having prepared for weeks, she felt nervous before the interview.",
    options: ["Despite", "Although", "In spite", "Even though"],
    correctAnswer: "Despite",
    category: "Contrast Linkers",
  },
  {
    id: 14,
    question: "Do you happen to know where ______?",
    options: ["is the library", "the library is", "does the library be", "be the library"],
    correctAnswer: "the library is",
    category: "Indirect Questions",
  },
  {
    id: 15,
    question: "Never ______ such a breathtaking architectural masterpiece.",
    options: ["I have seen", "have I seen", "did I saw", "I saw"],
    correctAnswer: "have I seen",
    category: "Inversions",
  },
  {
    id: 16,
    question: "By this time next year, our company ______ the new international branch.",
    options: ["will launch", "will be launching", "will have launched", "launches"],
    correctAnswer: "will have launched",
    category: "Future Perfect",
  },
  {
    id: 17,
    question: "The board insisted ______ reviewing the audit report before signing.",
    options: ["on", "in", "to", "for"],
    correctAnswer: "on",
    category: "Dependent Prepositions",
  },
  {
    id: 18,
    question: "Her sharp analysis really hit the ______ on the head.",
    options: ["nail", "hammer", "bullet", "target"],
    correctAnswer: "nail",
    category: "B2 Idiomatic Expressions",
  },
  {
    id: 19,
    question: "You haven't mentioned this contract to any outside parties, ______ you?",
    options: ["did", "haven't", "have", "do"],
    correctAnswer: "have",
    category: "Question Tags",
  },
  {
    id: 20,
    question: "Without your guidance, I would have failed. -> Had it ______ your guidance, I would have failed.",
    options: ["not been for", "not for", "without", "no being for"],
    correctAnswer: "not been for",
    category: "Key Word Transformations",
  },
];

interface LevelCheckClientProps {
  lastCheck: {
    levelResult: string;
    score: number;
    completedAt: Date;
    type: string;
  } | null;
  studentName: string;
}

export default function LevelCheckClient({ lastCheck, studentName }: LevelCheckClientProps) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ percentage: number; levelResult: string } | null>(null);

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIndex];
  const selectedAnswer = answers[currentIndex];

  const handleSelectOption = (opt: string) => {
    setAnswers({ ...answers, [currentIndex]: opt });
  };

  const handleNext = async () => {
    if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate score & submit
      let correct = 0;
      DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) {
          correct++;
        }
      });

      setIsSubmitting(true);
      try {
        const res = await submitLevelCheck(correct, DIAGNOSTIC_QUESTIONS.length, "weekly");
        setResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Intro Header */}
      {!started && !result && (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Weekly Milestone Assessment
            </span>
            <h1 className="text-3xl font-bold text-slate-900 mt-3">CEFR Level & Milestone Check</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
              Take this 20-question milestone check to assess your current CEFR benchmark (B1.1 → B2+), unlock new quests on your roadmap, and measure your weekly improvement.
            </p>
          </div>

          {/* Last Result if exists */}
          {lastCheck && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-sm mx-auto flex items-center justify-between text-left">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block">Previous Level</span>
                <span className="text-base font-bold text-slate-800">{lastCheck.levelResult}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase block">Score</span>
                <span className="text-base font-bold text-indigo-600">{lastCheck.score}%</span>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={() => setStarted(true)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300 inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Start Level Check (20 Questions)
            </button>
          </div>
        </div>
      )}

      {/* In-Progress Test Screen */}
      {started && !result && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                QUESTION {currentIndex + 1} OF {DIAGNOSTIC_QUESTIONS.length}
              </span>
              <h2 className="text-sm font-medium text-slate-300">{currentQ.category}</h2>
            </div>
            <span className="text-xs font-bold text-indigo-400">
              {Math.round(((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2">
            <div
              className="bg-indigo-600 h-2 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
            />
          </div>

          <div className="p-8 space-y-6">
            <p className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed">
              {currentQ.question}
            </p>

            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswer === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between",
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-700"
                    )}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600 text-sm font-semibold disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
            >
              {currentIndex < DIAGNOSTIC_QUESTIONS.length - 1 ? (
                <>
                  Next Question <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>Finish & See Level</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result Screen */}
      {result && (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-200">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Assessment Completed!
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3">Your Current CEFR Rating</h2>
            <div className="text-4xl font-extrabold text-indigo-600 mt-2">{result.levelResult}</div>
            <p className="text-slate-500 text-sm mt-2">
              Overall score: <b>{result.percentage}%</b>. Your teacher has been notified in Telegram!
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/roadmap"
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-sm"
            >
              View Quest Roadmap 🗺️
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setStarted(false);
                setCurrentIndex(0);
                setAnswers({});
              }}
              className="px-6 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retake Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
