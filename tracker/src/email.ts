// Weekly reminder email via the Cloudflare Email Sending binding (env.EMAIL.send).
// Best-effort: if the sending domain isn't onboarded yet, we log and no-op rather than throw.
import type { Timetable } from "./schedule";
import { sendViaSES, sesConfigured } from "./ses";

export function buildReminder(t: Timetable, appUrl: string) {
  const s = t.status;
  const statusLine =
    s.behind > 0
      ? `⚠️ You're <b>${s.behind} week${s.behind === 1 ? "" : "s"} behind</b> — time to catch up.`
      : s.behind < 0
      ? `🚀 You're <b>${-s.behind} week${s.behind === -1 ? "" : "s"} ahead</b>. Nice.`
      : `✅ You're <b>right on track</b>.`;

  const subject = s.nextWeekId
    ? `AI curriculum — this week: ${s.currentPhase} (${s.percent}% done)`
    : `AI curriculum — you've finished the schedule 🎓`;

  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto;color:#111">
      <h2 style="margin:0 0 4px">This week on your AI curriculum</h2>
      <p style="color:#555;margin:0 0 16px">${s.startDate} → ${s.finishDate}</p>
      <p style="font-size:16px">${statusLine}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#555">You are on</td><td style="text-align:right"><b>${s.currentPhase}</b></td></tr>
        <tr><td style="padding:6px 0;color:#555">This week</td><td style="text-align:right">${s.currentTitle}</td></tr>
        <tr><td style="padding:6px 0;color:#555">Next unfinished</td><td style="text-align:right">${s.nextWeekTitle ?? "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#555">Progress</td><td style="text-align:right"><b>${s.percent}%</b> · ${s.completedContent}/${s.totalContent} weeks</td></tr>
      </table>
      <a href="${appUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">Open the tracker →</a>
      <p style="color:#999;font-size:12px;margin-top:24px">You advance because you built something, not because you watched videos.</p>
    </div>`;

  const text =
    `This week on your AI curriculum (${s.startDate} → ${s.finishDate})\n\n` +
    `${s.behind > 0 ? `Behind by ${s.behind} week(s).` : s.behind < 0 ? `Ahead by ${-s.behind} week(s).` : "On track."}\n` +
    `On: ${s.currentPhase}\nThis week: ${s.currentTitle}\n` +
    `Next unfinished: ${s.nextWeekTitle ?? "—"}\n` +
    `Progress: ${s.percent}% (${s.completedContent}/${s.totalContent} weeks)\n\n` +
    `Open the tracker: ${appUrl}\n`;

  return { subject, html, text };
}

export async function sendReminder(env: any, t: Timetable): Promise<boolean> {
  const { subject, html, text } = buildReminder(t, env.APP_URL || "");
  if (!sesConfigured(env)) {
    console.error("reminder send skipped: SES not configured (missing AWS_* secrets)");
    return false;
  }
  const from = env.FROM_NAME ? `${env.FROM_NAME} <${env.FROM_EMAIL}>` : env.FROM_EMAIL;
  const res = await sendViaSES(env, { from, to: env.REMINDER_EMAIL, subject, html, text });
  if (res.ok) {
    console.log(`reminder sent to ${env.REMINDER_EMAIL} via SES`);
    return true;
  }
  console.error(`SES send failed (${res.status}): ${res.body}`);
  return false;
}

// Placeholder for the WhatsApp add-on (Meta WhatsApp Cloud API). No-op until
// WHATSAPP_TOKEN + WHATSAPP_PHONE_ID + WHATSAPP_TO are set as secrets.
export async function sendWhatsApp(env: any, t: Timetable): Promise<boolean> {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID || !env.WHATSAPP_TO) return false;
  const s = t.status;
  const body =
    `📚 AI curriculum — ${s.percent}% done.\n` +
    `On: ${s.currentPhase}\nThis week: ${s.currentTitle}\n` +
    `${s.behind > 0 ? `Behind ${s.behind}w` : s.behind < 0 ? `Ahead ${-s.behind}w` : "On track"}.`;
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: env.WHATSAPP_TO,
        type: "text",
        text: { body },
      }),
    });
    return r.ok;
  } catch (err) {
    console.error("whatsapp send failed:", (err as Error)?.message ?? err);
    return false;
  }
}
