"use client";

import { useState, useEffect } from "react";
import { getCardsForReview, submitCardReview, completeVocabSession } from "../actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCcw, CheckCircle2 } from "lucide-react";

type Card = Awaited<ReturnType<typeof getCardsForReview>>[0];

export default function ReviewPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, correct: 0 }); // correct = good or easy

  useEffect(() => {
    async function loadCards() {
      try {
        const data = await getCardsForReview();
        setCards(data);
      } catch (error) {
        console.error("Failed to load cards:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  const currentCard = cards[currentIndex];

  const handleResponse = async (response: 'again' | 'hard' | 'good' | 'easy') => {
    if (submitting || !currentCard) return;
    
    setSubmitting(true);
    
    try {
      await submitCardReview(currentCard.id, response);
      
      const isCorrect = response === 'good' || response === 'easy';
      setStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (isCorrect ? 1 : 0)
      }));

      if (currentIndex + 1 < cards.length) {
        setIsFlipped(false);
        // Small delay to allow flip animation to reset before changing content
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setSubmitting(false);
        }, 150);
      } else {
        setCompleted(true);
        completeVocabSession(stats.reviewed + 1, stats.correct + (isCorrect ? 1 : 0)).catch(console.error);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your reviews...</p>
      </div>
    );
  }

  if (completed || cards.length === 0) {
    const accuracy = stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {cards.length === 0 ? "You're all caught up!" : "Session Complete!"}
          </h1>
          
          {stats.reviewed > 0 && (
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-900 mb-1">{stats.reviewed}</p>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Reviewed</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-600 mb-1">{accuracy}%</p>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Accuracy</p>
              </div>
            </div>
          )}
          
          <Link href="/vocab" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 h-12 px-8 py-2">
            Return to Vocabulary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/vocab" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Exit Session
        </Link>
        <div className="text-sm font-medium text-slate-400">
          Card {currentIndex + 1} of {cards.length}
        </div>
      </div>

      <div className="perspective-1000 w-full mb-8" style={{ perspective: "1000px" }}>
        <div 
          className={cn(
            "relative w-full transition-transform duration-500 transform-style-3d min-h-[400px]",
            isFlipped ? "rotate-y-180" : ""
          )}
          style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl shadow-md border border-slate-200 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 transition-colors"
            style={{ backfaceVisibility: "hidden" }}
            onClick={() => setIsFlipped(true)}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 text-center break-words mb-8">
              {currentCard.word}
            </h2>
            <div className="mt-auto text-slate-400 flex items-center font-medium animate-pulse">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Click to reveal
            </div>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl shadow-md border border-indigo-200 p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <h3 className="text-2xl font-bold text-slate-400 mb-6 pb-6 border-b border-slate-100 w-full text-center">
              {currentCard.word}
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg">
              <p className="text-2xl font-medium text-slate-800 text-center mb-6">
                {currentCard.definition}
              </p>
              
              {currentCard.exampleSentence && (
                <div className="bg-slate-50 p-4 rounded-xl w-full border border-slate-100">
                  <p className="text-lg text-slate-600 italic text-center">
                    "{currentCard.exampleSentence}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={cn("transition-opacity duration-300 max-w-2xl mx-auto", isFlipped ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <h4 className="text-center text-slate-500 font-medium mb-4 uppercase tracking-wider text-sm">How well did you know this?</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => handleResponse('again')}
            disabled={submitting}
            className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
          >
            <span className="font-bold mb-1">Again</span>
            <span className="text-xs opacity-80">&lt; 1m</span>
          </button>
          
          <button 
            onClick={() => handleResponse('hard')}
            disabled={submitting}
            className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors disabled:opacity-50"
          >
            <span className="font-bold mb-1">Hard</span>
            <span className="text-xs opacity-80">Soon</span>
          </button>
          
          <button 
            onClick={() => handleResponse('good')}
            disabled={submitting}
            className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors disabled:opacity-50"
          >
            <span className="font-bold mb-1">Good</span>
            <span className="text-xs opacity-80">Ideal</span>
          </button>
          
          <button 
            onClick={() => handleResponse('easy')}
            disabled={submitting}
            className="flex flex-col items-center justify-center py-4 px-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50"
          >
            <span className="font-bold mb-1">Easy</span>
            <span className="text-xs opacity-80">Later</span>
          </button>
        </div>
      </div>
    </div>
  );
}
