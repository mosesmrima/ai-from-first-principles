// Push the next chunk of study (the rolling queue) to your phone via ntfy.sh.
// Topic is a shared secret stored as NTFY_TOPIC.
import type { Plan } from "./plan";

export function ntfyConfigured(env: any): boolean {
  return !!env.NTFY_TOPIC;
}

export async function sendSessionPush(env: any, plan: Plan): Promise<boolean> {
  if (!env.NTFY_TOPIC) return false;
  if (!plan.queue.length) return false;

  const list = plan.queue.slice(0, 6).map((x) => `• ${x.title} (~${x.minutes}m)`).join("\n");
  const hrs = (plan.queueMinutes / 60).toFixed(1);
  const title = `Today (~${hrs}h): ${plan.currentWeekTitle}`;
  const message = `${plan.currentPhase}\n${list}\n(${plan.percent}% overall)`;

  try {
    const r = await fetch("https://ntfy.sh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        topic: env.NTFY_TOPIC, title, message, tags: ["books"], click: env.APP_URL || undefined,
      }),
    });
    if (!r.ok) console.error("ntfy push failed", r.status, await r.text());
    return r.ok;
  } catch (err) {
    console.error("ntfy push error:", (err as Error)?.message ?? err);
    return false;
  }
}
