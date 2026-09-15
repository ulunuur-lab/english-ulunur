"use client";

import { useState } from "react";
import { submitTopicQuiz } from "./actions";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  type: "mcq" | "fill_blank";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface InteractiveQuizModalProps {
  topic: {
    id: number;
    title: string;
    description: string;
    world: number;
    isBoss: boolean;
    quizData: string | null;
  };
  onClose: () => void;
  onCompleted: () => void;
}

export default function InteractiveQuizModal({ topic, onClose, onCompleted }: InteractiveQuizModalProps) {
  const questions: Question[] = topic.quizData ? JSON.parse(topic.quizData) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submittedCurrent, setSubmittedCurrent] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [finalResult, setFinalResult] = useState<{ passed: boolean; score: number } | null>(null);

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <BookOpen className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">{topic.title}</h3>
          <p className="text-slate-600 text-sm mb-6">{topic.description}</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = userAnswers[currentIndex] || "";
  const isCorrect =
    currentAnswer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

  const handleSelectOption = (opt: string) => {
    if (submittedCurrent) return;
    setUserAnswers({ ...userAnswers, [currentIndex]: opt });
  };

  const handleCheckAnswer = () => {
    if (!currentAnswer.trim()) return;
    setSubmittedCurrent(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSubmittedCurrent(false);
    } else {
      // Finished all questions!
      setIsFinished(true);
      setIsSaving(true);
      const totalScore = score + (isCorrect ? 0 : 0); // already updated
      try {
        const res = await submitTopicQuiz(topic.id, totalScore, questions.length);
        setFinalResult(res);
        onCompleted();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              {topic.isBoss ? "🏆 BOSS CHALLENGE" : `WORLD ${topic.world} QUEST`}
            </span>
            <h2 className="text-lg font-bold leading-snug">{topic.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2">
          <div
            className="bg-indigo-600 h-2 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Area */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
          {!isFinished ? (
            <>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <span>TYPE: {currentQ.type.toUpperCase()}</span>
              </div>

              <p className="text-base md:text-lg font-semibold text-slate-800 leading-relaxed">
                {currentQ.question}
              </p>

              {/* MCQ Options */}
              {currentQ.type === "mcq" && currentQ.options && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = currentAnswer === opt;
                    const isTheRightOne = opt === currentQ.correctAnswer;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        disabled={submittedCurrent}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between",
                          !submittedCurrent && isSelected
                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                            : !submittedCurrent
                            ? "border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-700"
                            : submittedCurrent && isTheRightOne
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold"
                            : submittedCurrent && isSelected && !isTheRightOne
                            ? "border-red-400 bg-red-50 text-red-900"
                            : "border-slate-100 text-slate-400"
                        )}
                      >
                        <span>{opt}</span>
                        {submittedCurrent && isTheRightOne && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {submittedCurrent && isSelected && !isTheRightOne && (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the blank input */}
              {currentQ.type === "fill_blank" && (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => setUserAnswers({ ...userAnswers, [currentIndex]: e.target.value })}
                    disabled={submittedCurrent}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium text-slate-800"
                  />
                </div>
              )}

              {/* Explanation Card upon submission */}
              {submittedCurrent && (
                <div
                  className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed animate-fade-in flex items-start gap-3",
                    isCorrect
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border border-amber-200 text-amber-900"
                  )}
                >
                  <Sparkles className={cn("w-5 h-5 mt-0.5 flex-shrink-0", isCorrect ? "text-emerald-600" : "text-amber-600")} />
                  <div>
                    <span className="font-bold">{isCorrect ? "Correct! " : `Correction: "${currentQ.correctAnswer}". `}</span>
                    <span>{currentQ.explanation}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-6">
              <div
                className={cn(
                  "w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg",
                  finalResult?.passed
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200"
                    : "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-200"
                )}
              >
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {finalResult?.passed ? "Quest Cleared! 🎉" : "Keep Practicing! 💪"}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {finalResult?.passed
                    ? "You scored 70%+ and unlocked the next milestone on the roadmap."
                    : "You need 70% to pass and unlock the next level. Review the explanations and retry!"}
                </p>
              </div>

              <div className="inline-flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800">{score}</span>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Correct</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800">{questions.length}</span>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Total</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <span className="block text-2xl font-bold text-indigo-600">
                    {Math.round((score / questions.length) * 100)}%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Score</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          {!isFinished ? (
            !submittedCurrent ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!currentAnswer.trim()}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md flex items-center gap-2"
              >
                {currentIndex < questions.length - 1 ? "Next Question" : "Complete Quest"}
                <ChevronRight className="w-4 h-4" />
              </button>
            )
          ) : (
            <div className="flex gap-3 w-full">
              {!finalResult?.passed && (
                <button
                  onClick={() => {
                    setIsFinished(false);
                    setCurrentIndex(0);
                    setUserAnswers({});
                    setScore(0);
                    setSubmittedCurrent(false);
                  }}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
