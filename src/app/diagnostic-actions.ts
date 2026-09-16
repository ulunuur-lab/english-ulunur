"use server";

import { DIAGNOSTIC_30_QUESTIONS } from "@/lib/diagnostic-questions";

export interface DiagnosticResult {
  score: number;
  total: number;
  percentage: number;
  level: string;
  badge: string;
  summary: string;
  recommendations: string[];
  tierScores: {
    tier1: { score: number; total: number; name: string };
    tier2: { score: number; total: number; name: string };
    tier3: { score: number; total: number; name: string };
  };
  missedItems: { questionNumber: number; topic: string; yourAnswer: string; correctAnswer: string }[];
  isTeacherTest: boolean;
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8828359607:AAFEpXaJusqaorQtIhd2sDMm4enaVWxnmuY";
const TELEGRAM_TEACHER_CHAT_ID = process.env.TELEGRAM_TEACHER_CHAT_ID || "7957347033";

export async function submitDiagnosticCheck(
  studentName: string,
  answers: Record<number, string>
): Promise<DiagnosticResult> {
  const cleanName = (studentName || "Student").trim();
  const normalized = cleanName.toLowerCase();

  // ONLY if name is exactly "ulunur" (case-insensitive) -> teacher test mode (do not notify bot)
  const isTeacherTest = normalized === "ulunur";

  let totalScore = 0;
  let tier1Score = 0;
  let tier2Score = 0;
  let tier3Score = 0;
  const missedItems: { questionNumber: number; topic: string; yourAnswer: string; correctAnswer: string }[] = [];

  DIAGNOSTIC_30_QUESTIONS.forEach((q) => {
    const userAnswer = answers[q.id] || "No answer";
    const isCorrect = userAnswer === q.correctAnswer;

    if (isCorrect) {
      totalScore++;
      if (q.tier === 1) tier1Score++;
      if (q.tier === 2) tier2Score++;
      if (q.tier === 3) tier3Score++;
    } else {
      missedItems.push({
        questionNumber: q.id,
        topic: q.topic,
        yourAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
      });
    }
  });

  const percentage = Math.round((totalScore / DIAGNOSTIC_30_QUESTIONS.length) * 100);

  // CEFR diagnosis
  let level = "Solid B1";
  let badge = "B1";
  let summary = "";
  const recommendations: string[] = [];

  if (percentage >= 85) {
    level = "B2 Entry (High Readiness)";
    badge = "B2";
    summary = "Minimal decay from the break! You have retained your core B1 grammar and are ready to tackle upper-intermediate B2 topics immediately.";
    recommendations.push("Direct focus on Cleft sentences, Inversions, and Advanced Collocations.");
    recommendations.push("Begin exam-format sentence transformation practice.");
  } else if (percentage >= 65) {
    level = "B1+ (Ready for B2 Leap)";
    badge = "B1+";
    summary = "Good core foundation! Basic tenses are intact, but complex conditionals, passive voice, and dependent prepositions need rapid refreshing after the break.";
    recommendations.push("Quick 1-week reactivation of Past Continuous/Perfect and Mixed Conditionals.");
    recommendations.push("Focus heavily on dependent prepositions and phrasal verbs.");
  } else if (percentage >= 45) {
    level = "B1 (Language Rust Present)";
    badge = "B1";
    summary = "You have the B1 framework, but the 5-month study break caused noticeable precision loss in verb structures and conditional forms.";
    recommendations.push("Consolidate Present Perfect vs Past Simple and narrative tenses.");
    recommendations.push("Rebuild confidence with Second Conditionals and basic Passive Voice.");
  } else {
    level = "A2+ / Rusty B1 (Needs Foundation Boost)";
    badge = "A2+";
    summary = "Significant language rust from the 5-month pause. Core vocabulary is recognized, but grammatical rules need systematic re-anchoring before advancing.";
    recommendations.push("Prioritize basic tense harmony and irregular verbs.");
    recommendations.push("Master daily B1 vocabulary lists with active flashcards.");
  }

  const result: DiagnosticResult = {
    score: totalScore,
    total: DIAGNOSTIC_30_QUESTIONS.length,
    percentage,
    level,
    badge,
    summary,
    recommendations,
    tierScores: {
      tier1: { score: tier1Score, total: 10, name: "Foundations (A2/B1)" },
      tier2: { score: tier2Score, total: 10, name: "Core B1 Competencies" },
      tier3: { score: tier3Score, total: 10, name: "B1+/B2 Gateway Structures" },
    },
    missedItems,
    isTeacherTest,
  };

  // SEND DETAILED PEDAGOGICAL REPORT TO TELEGRAM (if not ulunur)
  if (!isTeacherTest && TELEGRAM_BOT_TOKEN && TELEGRAM_TEACHER_CHAT_ID) {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let tgMsg = `📊 <b>DIAGNOSTIC LEVEL CHECK REPORT</b>\n`;
    tgMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
    tgMsg += `👤 <b>Student:</b> ${cleanName}\n`;
    tgMsg += `⏰ <b>Completed:</b> ${now}\n`;
    tgMsg += `🎯 <b>Overall Score:</b> <b>${totalScore}/30 (${percentage}%)</b>\n`;
    tgMsg += `🏷️ <b>Placement:</b> <b>${level}</b>\n\n`;

    tgMsg += `📈 <b>COMPETENCY TIER BREAKDOWN:</b>\n`;
    tgMsg += `1️⃣ <b>Foundations (A2/B1):</b> ${tier1Score}/10 ${tier1Score >= 8 ? "✅ Solid" : "⚠️ Rusty"}\n`;
    tgMsg += `2️⃣ <b>Core B1:</b> ${tier2Score}/10 ${tier2Score >= 7 ? "✅ Good" : "⚠️ Needs Review"}\n`;
    tgMsg += `3️⃣ <b>B1+/B2 Gateways:</b> ${tier3Score}/10 ${tier3Score >= 6 ? "🚀 Advanced" : "⏳ Target Focus"}\n\n`;

    if (missedItems.length > 0) {
      tgMsg += `🔍 <b>MISSED TOPICS & ERRORS (${missedItems.length}):</b>\n`;
      missedItems.forEach((m) => {
        tgMsg += `• Q${m.questionNumber} (${m.topic}):\n   ❌ <i>"${m.yourAnswer}"</i> → ✅ <b>"${m.correctAnswer}"</b>\n`;
      });
      tgMsg += `\n`;
    }

    // Strategic roadmap roadmap recommendation based on data
    tgMsg += `🗺️ <b>RECOMMENDED ROADMAP FOCUS:</b>\n`;
    if (tier1Score < 8) {
      tgMsg += `• <b>Week 1 Priority:</b> Re-anchor Present Perfect vs Past Simple & Duration (for/since).\n`;
    }
    if (tier2Score < 8) {
      tgMsg += `• <b>Week 2 Priority:</b> Narrative past sequencing, 'used to' habits & 2nd Conditionals.\n`;
    }
    if (tier3Score < 7) {
      tgMsg += `• <b>Week 3-4 Priority:</b> Mixed Conditionals, Passive Voice across tenses & Dependent Prepositions.\n`;
    }
    tgMsg += `━━━━━━━━━━━━━━━━━━━━`;

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_TEACHER_CHAT_ID,
          text: tgMsg,
          parse_mode: "HTML",
        }),
      });
    } catch (err) {
      console.error("Telegram notification error:", err);
    }
  }

  return result;
}
