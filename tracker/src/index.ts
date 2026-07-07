// AI Curriculum Tracker — Cloudflare Worker.
// Serves the static frontend (ASSETS) and a small JSON API backed by D1,
// plus a weekly cron that emails a schedule reminder.
import { buildTimetable, dailyPlan, type Milestone, type Settings } from "./schedule";
import { sendNtfy } from "./ntfy";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  EMAIL: any;
  FROM_EMAIL: string;
  FROM_NAME: string;
  REMINDER_EMAIL: string;
  APP_URL: string;
  ACCESS_PASSWORD?: string; // if set, the whole app requires this password
  NTFY_TOPIC?: string; // ntfy.sh topic for daily phone push reminders
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
    study_days: s.study_days ?? "1,2,3,4,5,6", // 0=Sun … 6=Sat (default Mon–Sat)
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
    const allowed = ["start_date", "pace_weeks_per_slot", "buffer_per_phase", "reminder_enabled", "timezone", "study_days"];
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

  // POST /api/test-reminder — push today's session to your phone now (for testing)
  if (path === "/api/test-reminder" && method === "POST") {
    const [milestones, settings] = await Promise.all([loadMilestones(env), loadSettings(env)]);
    const plan = dailyPlan(milestones, settings, Date.now());
    const ok = await sendNtfy(env, plan);
    return json({ sent: ok, isStudyDay: plan.isStudyDay, session: plan.sessionTitle });
  }

  return json({ error: "not found" }, 404);
}

// --- password gate ----------------------------------------------------------
const AUTH_COOKIE = "ai_tracker_auth";

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function getCookie(req: Request, name: string): string | null {
  const h = req.headers.get("cookie");
  if (!h) return null;
  for (const part of h.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}
async function expectedToken(env: Env): Promise<string> {
  return sha256Hex("v1:" + env.ACCESS_PASSWORD);
}
async function isAuthed(req: Request, env: Env): Promise<boolean> {
  if (!env.ACCESS_PASSWORD) return true; // no password configured → open
  return getCookie(req, AUTH_COOKIE) === (await expectedToken(env));
}

const LOGIN_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in</title>
<style>body{font-family:system-ui,Segoe UI,Roboto,sans-serif;background:#0f0f14;color:#ececf2;display:grid;place-items:center;min-height:100vh;margin:0}
form{background:#1a1a22;padding:28px;border-radius:14px;border:1px solid #2a2a35;width:min(90vw,340px)}
h1{font-size:18px;margin:0 0 16px}input{width:100%;padding:11px;border-radius:8px;border:1px solid #2a2a35;background:#0f0f14;color:#ececf2;box-sizing:border-box}
button{width:100%;margin-top:10px;padding:11px;border:0;border-radius:8px;background:#8b83ff;color:#111;font-weight:700;cursor:pointer}
.err{color:#f87171;font-size:13px;min-height:18px;margin-top:8px}</style></head>
<body><form onsubmit="return login(event)"><h1>🧠 AI Tracker — sign in</h1>
<input id="p" type="password" placeholder="Password" autofocus autocomplete="current-password">
<div class="err" id="e"></div><button>Enter</button></form>
<script>async function login(ev){ev.preventDefault();const p=document.getElementById('p').value;
const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:p})});
if(r.ok){location.reload()}else{document.getElementById('e').textContent='Wrong password'}return false}</script>
</body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // Login endpoint (must be reachable while unauthenticated).
    if (url.pathname === "/api/login" && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as { password?: string };
      if (env.ACCESS_PASSWORD && body.password === env.ACCESS_PASSWORD) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "set-cookie": `${AUTH_COOKIE}=${await expectedToken(env)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=34560000`,
          },
        });
      }
      return json({ ok: false }, 401);
    }

    // Gate everything else behind the password.
    if (!(await isAuthed(req, env))) {
      if (url.pathname.startsWith("/api/")) return json({ error: "unauthorized" }, 401);
      return new Response(LOGIN_HTML, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    }

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

  // Runs daily (cron in wrangler.jsonc). Pushes today's study session to your
  // phone via ntfy — but only on your configured study days.
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        const [settings, milestones] = await Promise.all([loadSettings(env), loadMilestones(env)]);
        if ((settings.reminder_enabled ?? "1") === "0") return;
        const plan = dailyPlan(milestones, settings, Date.now());
        if (plan.isStudyDay) await sendNtfy(env, plan);
      })()
    );
  },
};
