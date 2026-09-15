/**
 * Telegram Notification Service for Ulunur's English
 * Sends real-time activity pings directly to the teacher's Telegram
 */

interface TelegramAlertPayload {
  studentName?: string;
  type: "homework_submitted" | "vocab_reviewed" | "level_check_completed" | "lesson_completed" | "streak_milestone";
  title: string;
  details: string;
  score?: number | string;
  link?: string;
}

export async function sendTelegramNotification(payload: TelegramAlertPayload): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_TEACHER_CHAT_ID;

  if (!botToken || !chatId || botToken === "placeholder" || chatId === "placeholder") {
    console.log("[Telegram Notification Skipped]: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_TEACHER_CHAT_ID in environment.");
    return false;
  }

  const icons: Record<TelegramAlertPayload["type"], string> = {
    homework_submitted: "📝",
    vocab_reviewed: "⚡",
    level_check_completed: "🏁",
    lesson_completed: "📖",
    streak_milestone: "🔥",
  };

  const icon = icons[payload.type] || "🔔";
  const student = payload.studentName || "Student";
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let message = `${icon} <b>Ulunur's English Alert</b> [${timestamp}]\n\n`;
  message += `👤 <b>Student:</b> ${student}\n`;
  message += `📌 <b>Action:</b> ${payload.title}\n`;
  message += `ℹ️ <b>Details:</b> ${payload.details}\n`;

  if (payload.score !== undefined) {
    message += `🎯 <b>Score/Result:</b> ${payload.score}\n`;
  }

  if (payload.link) {
    message += `\n🔗 <a href="${payload.link}">Open in Platform</a>`;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (err) {
    console.error("[Telegram Notification Error]:", err);
    return false;
  }
}
