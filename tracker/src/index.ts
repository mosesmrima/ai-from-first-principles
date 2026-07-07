// AI Curriculum Tracker — Cloudflare Worker.
// Serves the static frontend (ASSETS) and a small JSON API backed by D1,
// plus a weekly cron that emails a schedule reminder.
import { buildTimetable, type Milestone, type Settings } from "./schedule";
import { sendReminder, sendWhatsApp } from "./email";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  EMAIL: any;
  FROM_EMAIL: string;
  FROM_NAME: string;
  REMINDER_EMAIL: string;
  APP_URL: string;
  WHATSAPP_TOKEN?: string;
  WHATSAPP_PHONE_ID?: string;
  WHATSAPP_TO?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function loadSettings(env: Env): Promise<Settings> {
  const rows = await env.DB.prepare("SELECT key, value FROM settings").all<{ key: string; value: string }>();
  const s: Record<string, string> = {};
  for (const r of rows.results ?? []) s[r.key] = r.value;
  return {
    start_date: s.start_date ?? "2026-07-08",
    pace_weeks_per_slot: s.pace_weeks_per_slot ?? "1",
    buffer_per_phase: s.buffer_per_phase ?? "1",
    ...s,
  };
}

async function loadMilestones(env: Env): Promise<Milestone[]> {
  const rows = await env.DB.prepare("SELECT * FROM milestones ORDER BY sort").all<Milestone>();
  return rows.results ?? [];
}

async function loadResources(env: Env) {
  const rows = await env.DB
    .prepare("SELECT id, scope, ref, title, url, kind, pinned FROM resources ORDER BY pinned DESC, sort")
    .all();
  return rows.results ?? [];
}

async function getState(env: Env) {
  const [milestones, settings, resources] = await Promise.all([
    loadMilestones(env),
    loadSettings(env),
    loadResources(env),
  ]);
  const schedule = buildTimetable(milestones, settings, Date.now());
  return { milestones, settings, resources, schedule };
}

const YT = /(?:youtube\.com|youtu\.be)/i;

async function handleApi(req: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, "");
  const method = req.method.toUpperCase();

  // GET /api/state
  if (path === "/api/state" && method === "GET") {
    return json(await getState(env));
  }

  // POST /api/milestones/:id/toggle   body: { done: boolean }
  const toggle = path.match(/^\/api\/milestones\/([\w-]+)\/toggle$/);
  if (toggle && method === "POST") {
    const id = toggle[1];
    const body = await req.json().catch(() => ({}));
    const done = (body as any).done ? 1 : 0;
    const res = await env.DB.prepare(
      "UPDATE milestones SET done = ?, done_at = ? WHERE id = ?"
    )
      .bind(done, done ? new Date().toISOString() : null, id)
      .run();
    if (!res.meta.changes) return json({ error: "unknown milestone" }, 404);
    return json({ id, done: !!done });
  }

  // PUT /api/settings   body: { start_date?, pace_weeks_per_slot?, buffer_per_phase?, reminder_enabled? }
  if (path === "/api/settings" && method === "PUT") {
    const body = (await req.json().catch(() => ({}))) as Record<string, string>;
    const allowed = ["start_date", "pace_weeks_per_slot", "buffer_per_phase", "reminder_enabled", "timezone"];
    const stmts = [];
    for (const k of allowed) {
      if (body[k] !== undefined) {
        stmts.push(
          env.DB.prepare(
            "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
          ).bind(k, String(body[k]))
        );
      }
    }
    if (stmts.length) await env.DB.batch(stmts);
    return json(await getState(env));
  }

  // POST /api/resources   body: { scope, ref, title, url }
  if (path === "/api/resources" && method === "POST") {
    const b = (await req.json().catch(() => ({}))) as any;
    if (!b.ref || !b.url || !b.title) return json({ error: "title, url, ref required" }, 400);
    const kind = YT.test(b.url) ? "youtube" : "link";
    const row = await env.DB
      .prepare("INSERT INTO resources (scope, ref, title, url, kind, pinned, sort) VALUES (?, ?, ?, ?, ?, 1, 999) RETURNING id")
      .bind(b.scope === "week" ? "week" : "phase", b.ref, b.title, b.url, kind)
      .first<{ id: number }>();
    return json({ id: row?.id, kind });
  }

  // DELETE /api/resources/:id
  const delRes = path.match(/^\/api\/resources\/(\d+)$/);
  if (delRes && method === "DELETE") {
    await env.DB.prepare("DELETE FROM resources WHERE id = ? AND pinned = 1").bind(Number(delRes[1])).run();
    return json({ ok: true });
  }

  // POST /api/test-reminder — send the weekly email now (for testing)
  if (path === "/api/test-reminder" && method === "POST") {
    const { schedule } = await getState(env);
    const ok = await sendReminder(env, schedule);
    return json({ sent: ok });
  }

  return json({ error: "not found" }, 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(req, env, url);
      } catch (err) {
        console.error("api error:", (err as Error)?.message ?? err);
        return json({ error: "internal error" }, 500);
      }
    }
    // Everything else → static frontend.
    return env.ASSETS.fetch(req);
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        const settings = await loadSettings(env);
        if ((settings.reminder_enabled ?? "1") === "0") return;
        const { schedule } = await getState(env);
        await sendReminder(env, schedule);
        await sendWhatsApp(env, schedule); // no-op until WhatsApp secrets are set
      })()
    );
  },
};
