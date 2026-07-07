// Push a daily study-session reminder to your phone via ntfy.sh — free, no account.
// The topic name is a shared secret (anyone who knows it can publish/read), so it's
// stored as the NTFY_TOPIC Worker secret and should be long/unguessable.
import type { DailyPlan } from "./schedule";

export function ntfyConfigured(env: any): boolean {
  return !!env.NTFY_TOPIC;
}

export async function sendNtfy(env: any, plan: DailyPlan): Promise<boolean> {
  if (!env.NTFY_TOPIC) return false;
  const statusLine =
    plan.behind > 0 ? `⚠️ ${plan.behind}w behind` : plan.behind < 0 ? `🚀 ${-plan.behind}w ahead` : `✅ on track`;
  const hrs = `~${plan.sessionHours}h`;
  const title = plan.isBuffer
    ? `Review day (${hrs}) — ${plan.percent}% done`
    : `Session ${plan.sessionIndex}/${plan.sessionsThisWeek} · ${hrs}: ${plan.sessionTitle}`;
  const message =
    `${plan.weekPhase} — ${plan.weekTitle}\n` +
    `${plan.sessionFocus}\n` +
    `(${statusLine} · ${plan.percent}% overall)`;
  try {
    const r = await fetch("https://ntfy.sh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        topic: env.NTFY_TOPIC,
        title,
        message,
        tags: ["books"],
        click: env.APP_URL || undefined,
      }),
    });
    if (r.ok) console.log("ntfy push sent");
    else console.error("ntfy push failed", r.status, await r.text());
    return r.ok;
  } catch (err) {
    console.error("ntfy push error:", (err as Error)?.message ?? err);
    return false;
  }
}
