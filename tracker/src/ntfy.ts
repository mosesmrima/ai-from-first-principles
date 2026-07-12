// Push notifications via ntfy.sh — free, no account. Each user sets their own
// topic (a secret-ish string they subscribe to in the ntfy app). ntfy.sh sits
// behind Cloudflare and Worker->ntfy fetches occasionally 522, so we retry.
import type { Plan } from "./plan";

const DEFAULT_SERVER = "https://ntfy.sh";

function normServer(server?: string): string {
  const s = (server || DEFAULT_SERVER).trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(s) ? s : "https://" + s;
}

async function post(server: string | undefined, payload: Record<string, unknown>, attempts = 3): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(normServer(server), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) return true;
      console.error(`ntfy push failed (attempt ${i + 1}/${attempts})`, r.status, await r.text());
    } catch (err) {
      console.error(`ntfy push error (attempt ${i + 1}/${attempts}):`, (err as Error)?.message ?? err);
    }
    if (i < attempts - 1) await new Promise((res) => setTimeout(res, 400 * (i + 1)));
  }
  return false;
}

/** Push the user's current study queue to their ntfy topic. */
export async function sendSessionPush(topic: string | undefined, plan: Plan, appUrl?: string, server?: string): Promise<boolean> {
  if (!topic) return false;
  if (!plan.queue.length) return false;
  const list = plan.queue.slice(0, 6).map((x) => `• ${x.title} (~${x.minutes}m)`).join("\n");
  const hrs = (plan.queueMinutes / 60).toFixed(1);
  return post(server, {
    topic,
    title: `Today (~${hrs}h): ${plan.currentWeekTitle}`,
    message: `${plan.currentPhase}\n${list}\n(${plan.percent}% overall)`,
    tags: ["books"],
    click: appUrl || undefined,
  });
}

/** Generic alert (used for admin signup notifications). */
export async function sendAlert(topic: string | undefined, title: string, message: string, appUrl?: string, server?: string): Promise<boolean> {
  if (!topic) return false;
  return post(server, { topic, title, message, tags: ["bust_in_silhouette"], click: appUrl || undefined });
}
