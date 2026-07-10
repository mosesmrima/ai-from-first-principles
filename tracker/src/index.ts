// AI Curriculum Tracker — Worker. Single-model: ordered STEPS → sessions → "next".
import { computePlan, type Settings } from "./plan";
import { sendSessionPush } from "./ntfy";
import { WEEKS } from "./curriculum";
import { commitFile, githubConfigured } from "./github";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_URL: string;
  ACCESS_PASSWORD?: string;
  NTFY_TOPIC?: string;
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

/** The step id of a week's "note" step, e.g. week01.9 — used to auto-tick on push. */
function noteStepId(weekId: string): string | null {
  const w = WEEKS.find((x) => x.id === weekId);
  if (!w) return null;
  const i = w.steps.findIndex((s) => s.kind === "note");
  return i >= 0 ? `${weekId}.${i}` : null;
}

function noteTemplate(weekId: string): string {
  const w = WEEKS.find((x) => x.id === weekId);
  const title = w ? w.title : weekId;
  return `# ${weekId} — ${title}\n\n- **Learned:**\n\n- **Confused by:**\n\n- **Built:**\n\n- **Next:**\n`;
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
    session_minutes: s.session_minutes ?? "120",
    study_days: s.study_days ?? "1,2,3,4,5,6",
    reminder_enabled: s.reminder_enabled ?? "1",
    ...s,
  };
}

async function loadDone(env: Env): Promise<Set<string>> {
  const rows = await env.DB.prepare("SELECT step_id FROM step_progress").all<{ step_id: string }>();
  return new Set((rows.results ?? []).map((r) => r.step_id));
}

async function loadNote(env: Env, weekId: string): Promise<string> {
  const row = await env.DB.prepare("SELECT body FROM notes WHERE week_id = ?").bind(weekId).first<{ body: string }>();
  return row?.body ?? noteTemplate(weekId);
}

async function getState(env: Env) {
  const [settings, done] = await Promise.all([loadSettings(env), loadDone(env)]);
  const plan = computePlan(done, settings, Date.now());
  const weekId = plan.currentWeekId;
  const note = weekId ? { weekId, body: await loadNote(env, weekId) } : null;
  return { settings, plan, note, githubReady: githubConfigured(env) };
}

async function handleApi(req: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, "");
  const method = req.method.toUpperCase();

  if (path === "/api/state" && method === "GET") {
    return json(await getState(env));
  }

  // POST /api/steps/:id/toggle  body: { done }
  const toggle = path.match(/^\/api\/steps\/([\w.-]+)\/toggle$/);
  if (toggle && method === "POST") {
    const id = decodeURIComponent(toggle[1]);
    const body = (await req.json().catch(() => ({}))) as { done?: boolean };
    if (body.done) {
      await env.DB.prepare("INSERT OR REPLACE INTO step_progress (step_id, done_at) VALUES (?, ?)")
        .bind(id, new Date().toISOString())
        .run();
    } else {
      await env.DB.prepare("DELETE FROM step_progress WHERE step_id = ?").bind(id).run();
    }
    return json(await getState(env));
  }

  // PUT /api/settings
  if (path === "/api/settings" && method === "PUT") {
    const body = (await req.json().catch(() => ({}))) as Record<string, string>;
    const allowed = ["start_date", "session_minutes", "study_days", "reminder_enabled", "timezone"];
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

  // PUT /api/notes/:weekId  body: { body, push?: boolean }
  // Saves the note to D1 and (optionally) commits it to GitHub as notes/<weekId>.md
  const note = path.match(/^\/api\/notes\/([\w-]+)$/);
  if (note && method === "PUT") {
    const weekId = note[1];
    const b = (await req.json().catch(() => ({}))) as { body?: string; push?: boolean };
    const text = (b.body ?? "").trim();
    if (!text) return json({ error: "note is empty" }, 400);

    await env.DB.prepare(
      "INSERT INTO notes (week_id, body, updated_at) VALUES (?, ?, ?) " +
        "ON CONFLICT(week_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at"
    )
      .bind(weekId, text, new Date().toISOString())
      .run();

    let pushed = false;
    let commitUrl = "";
    let error = "";
    if (b.push) {
      if (!githubConfigured(env)) {
        error = "GITHUB_TOKEN not set — saved locally only.";
      } else {
        try {
          const res = await commitFile(env, `notes/${weekId}.md`, text + "\n", `notes(${weekId}): update learning note`);
          pushed = true;
          commitUrl = res.commitUrl;
          // Reward: tick the week's note step automatically.
          const sid = noteStepId(weekId);
          if (sid) {
            await env.DB.prepare("INSERT OR REPLACE INTO step_progress (step_id, done_at) VALUES (?, ?)")
              .bind(sid, new Date().toISOString())
              .run();
          }
        } catch (err) {
          error = (err as Error)?.message ?? "push failed";
        }
      }
    }
    return json({ saved: true, pushed, commitUrl, error, ...(await getState(env)) });
  }

  // POST /api/test-reminder — push the current session to your phone now
  if (path === "/api/test-reminder" && method === "POST") {
    const { plan } = await getState(env);
    const ok = await sendSessionPush(env, plan);
    return json({ sent: ok, session: plan.currentSessionIndex + 1 });
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
  if (!env.ACCESS_PASSWORD) return true;
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
    return env.ASSETS.fetch(req);
  },

  // Daily at the cron time; pushes the current session on study days only.
  async scheduled(_e: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        const settings = await loadSettings(env);
        if ((settings.reminder_enabled ?? "1") === "0") return;
        const studyDays = (settings.study_days ?? "1,2,3,4,5,6").split(",").map((x) => parseInt(x, 10));
        if (!studyDays.includes(new Date().getUTCDay())) return;
        const { plan } = await getState(env);
        await sendSessionPush(env, plan);
      })()
    );
  },
};
