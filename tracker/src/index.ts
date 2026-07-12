// AI Curriculum Tracker — multi-user Worker.
// Users register with an invite code (capped at MAX_USERS), get an HMAC-signed
// session cookie, and all progress/notes/settings/GitHub config is per-user.
// A leaderboard ranks users by server-computed progress and streak.
import { computePlan, type Settings } from "./plan";
import { sendSessionPush, sendAlert } from "./ntfy";
import { WEEKS } from "./curriculum";
import { commitFile, githubConfigured, type GhEnv } from "./github";
import { hashPassword, verifyPassword, makeSession, readSession, encryptToken, decryptToken } from "./auth";
import { GUIDES } from "./guides";
import { notifyApproved, notifyRevoked, notifySignup, notifyPending, notifyInactive, notifyVerifyCode } from "./notify";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_URL: string;
  ACCESS_PASSWORD?: string; // root secret: signs sessions, encrypts tokens
  INVITE_CODE?: string;
  NTFY_TOPIC?: string;
  ADMIN_EMAIL?: string;
  FROM_EMAIL?: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  // legacy single-user GitHub config — used as fallback for user 1 (owner)
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

const MAX_USERS = 50;
const INVITE_MAX_USES = 10; // after this, the code stops working (requests still allowed)
const COOKIE = "ai_tracker_session";

interface User {
  id: number;
  name: string;
  email: string | null;
  status: string; // 'pending' | 'active' | 'revoked'
  revoke_reason: string | null;
  revoked_at: string | null;
  pass_salt: string;
  pass_hash: string;
  gh_token_enc: string | null;
  gh_owner: string | null;
  gh_repo: string | null;
  gh_branch: string | null;
}

const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

function getCookie(req: Request, name: string): string | null {
  const h = req.headers.get("cookie");
  if (!h) return null;
  for (const part of h.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}
const setCookie = (v: string) =>
  `${COOKIE}=${v}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=34560000`;

/* ---------------- per-user data access ---------------- */

async function loadSettings(env: Env, userId: number): Promise<Settings> {
  const rows = await env.DB.prepare("SELECT key, value FROM user_settings WHERE user_id = ?")
    .bind(userId)
    .all<{ key: string; value: string }>();
  const s: Record<string, string> = {};
  for (const r of rows.results ?? []) s[r.key] = r.value;
  return {
    start_date: s.start_date ?? new Date().toISOString().slice(0, 10),
    session_minutes: s.session_minutes ?? "120",
    study_days: s.study_days ?? "1,2,3,4,5,6",
    reminder_enabled: s.reminder_enabled ?? "1",
    ...s,
  };
}

async function loadDone(env: Env, userId: number): Promise<Set<string>> {
  const rows = await env.DB.prepare("SELECT step_id FROM user_steps WHERE user_id = ?")
    .bind(userId)
    .all<{ step_id: string }>();
  return new Set((rows.results ?? []).map((r) => r.step_id));
}

async function loadNote(env: Env, userId: number, weekId: string): Promise<string> {
  const row = await env.DB.prepare("SELECT body FROM user_notes WHERE user_id = ? AND week_id = ?")
    .bind(userId, weekId)
    .first<{ body: string }>();
  return row?.body ?? noteTemplate(weekId);
}

function noteStepId(weekId: string): string | null {
  const w = WEEKS.find((x) => x.id === weekId);
  if (!w) return null;
  const i = w.steps.findIndex((s) => s.kind === "note");
  return i >= 0 ? `${weekId}.${i}` : null;
}

function noteTemplate(weekId: string): string {
  const w = WEEKS.find((x) => x.id === weekId);
  return `# ${weekId} — ${w ? w.title : weekId}\n\n- **Learned:**\n\n- **Confused by:**\n\n- **Built:**\n\n- **Next:**\n`;
}

function genNtfyTopic(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "aitracker-" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function ensureNtfyTopic(env: Env, userId: number, settings: Settings): Promise<Settings> {
  if (settings.ntfy_topic) return settings;
  const topic = genNtfyTopic();
  await env.DB.prepare(
    "INSERT INTO user_settings (user_id, key, value) VALUES (?, 'ntfy_topic', ?) " +
      "ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value"
  ).bind(userId, topic).run();
  return { ...settings, ntfy_topic: topic };
}

async function getUser(env: Env, userId: number): Promise<User | null> {
  return env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<User>();
}

/** Per-user GitHub config; user 1 falls back to the env-level config. */
async function ghEnvFor(env: Env, user: User): Promise<GhEnv> {
  if (user.gh_token_enc && user.gh_owner && user.gh_repo) {
    return {
      GITHUB_TOKEN: await decryptToken(env.ACCESS_PASSWORD!, user.gh_token_enc),
      GITHUB_OWNER: user.gh_owner,
      GITHUB_REPO: user.gh_repo,
      GITHUB_BRANCH: user.gh_branch || "master",
    };
  }
  if (user.id === 1 && env.GITHUB_TOKEN) {
    return { GITHUB_TOKEN: env.GITHUB_TOKEN, GITHUB_OWNER: env.GITHUB_OWNER, GITHUB_REPO: env.GITHUB_REPO, GITHUB_BRANCH: env.GITHUB_BRANCH };
  }
  return {};
}

async function getState(env: Env, user: User) {
  let [settings, done] = await Promise.all([loadSettings(env, user.id), loadDone(env, user.id)]);
  settings = await ensureNtfyTopic(env, user.id, settings);
  const plan = computePlan(done, settings, Date.now());
  const weekId = plan.currentWeekId;
  const note = weekId ? { weekId, body: await loadNote(env, user.id, weekId) } : null;
  const gh = await ghEnvFor(env, user);
  return {
    settings,
    plan,
    note,
    guide: (weekId && GUIDES[weekId]) || null,
    curriculumRepo: "https://github.com/mosesmrima/ai-curriculum-starter",
    githubReady: githubConfigured(gh),
    user: { name: user.name, isAdmin: user.id === 1, githubRepo: gh.GITHUB_OWNER ? `${gh.GITHUB_OWNER}/${gh.GITHUB_REPO}` : null },
  };
}

/* ---------------- leaderboard (server-computed) ---------------- */

function computeStreak(doneDates: Set<string>, studyDays: number[], now: number): number {
  const DAY = 86_400_000;
  let streak = 0;
  let t = now;
  const key = (ts: number) => new Date(ts).toISOString().slice(0, 10);
  const dow = (ts: number) => new Date(ts).getUTCDay();
  // today doesn't break the streak if it hasn't started yet
  if (!doneDates.has(key(t))) t -= DAY;
  for (let i = 0; i < 3650; i++, t -= DAY) {
    if (!studyDays.includes(dow(t))) continue; // rest days neither count nor break
    if (doneDates.has(key(t))) streak++;
    else break;
  }
  return streak;
}

async function leaderboard(env: Env) {
  const users = (await env.DB.prepare("SELECT id, name FROM users WHERE status = 'active' ORDER BY id").all<{ id: number; name: string }>())
    .results ?? [];
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString();
  const out = [];
  for (const u of users) {
    const rows = (await env.DB.prepare("SELECT step_id, done_at FROM user_steps WHERE user_id = ?")
      .bind(u.id)
      .all<{ step_id: string; done_at: string }>()).results ?? [];
    const settings = await loadSettings(env, u.id);
    const plan = computePlan(new Set(rows.map((r) => r.step_id)), settings, now);
    const doneDates = new Set(rows.filter((r) => r.done_at).map((r) => r.done_at.slice(0, 10)));
    const studyDays = settings.study_days.split(",").map((x) => parseInt(x, 10));
    out.push({
      name: u.name,
      percent: plan.percent,
      doneSteps: plan.doneSteps,
      totalSteps: plan.totalSteps,
      weekSteps: rows.filter((r) => r.done_at && r.done_at >= weekAgo).length,
      streak: computeStreak(doneDates, studyDays, now),
      currentWeek: plan.currentWeekTitle,
    });
  }
  out.sort((a, b) => b.percent - a.percent || b.weekSteps - a.weekSteps || b.streak - a.streak);
  return out;
}

/* ---------------- API ---------------- */

async function handleApi(req: Request, env: Env, url: URL, userId: number | null, ctx: ExecutionContext): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, "");
  const method = req.method.toUpperCase();
  const secret = env.ACCESS_PASSWORD!;

  // ---- public: register / login ----
  if (path === "/api/register" && method === "POST") {
    const b = (await req.json().catch(() => ({}))) as { invite?: string; name?: string; email?: string; password?: string };
    const invite = (b.invite ?? "").trim();
    // Invite code is a fast-pass, not a wall: correct code -> instantly active;
    // no code -> pending admin approval; wrong code -> explicit error.
    if (invite && (!env.INVITE_CODE || invite !== env.INVITE_CODE)) {
      return json({ error: "that invite code isn't right — leave it blank to request access instead" }, 403);
    }
    if (invite) {
      const used = await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE joined_via_invite = 1 AND status != 'unverified'").first<{ n: number }>();
      if ((used?.n ?? 0) >= INVITE_MAX_USES) {
        return json({ error: "this invite code has reached its limit — sign up without it to request access" }, 403);
      }
    }
    const autoIn = !!invite;
    const name = (b.name ?? "").trim();
    const email = (b.email ?? "").trim();
    if (!/^[\w .-]{2,24}$/.test(name)) return json({ error: "name must be 2–24 letters/numbers" }, 400);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "a valid email is required" }, 400);
    if (!b.password || b.password.length < 6) return json({ error: "password must be 6+ chars" }, 400);
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE status != 'revoked'").first<{ n: number }>();
    if ((count?.n ?? 0) >= MAX_USERS) return json({ error: `signups are capped at ${MAX_USERS} users` }, 403);
    // stale unverified signups don't squat names/emails — replace them
    await env.DB.prepare("DELETE FROM users WHERE status = 'unverified' AND (lower(name) = lower(?) OR lower(email) = lower(?))")
      .bind(name, email).run();
    const dupe = await env.DB.prepare("SELECT id FROM users WHERE lower(name) = lower(?)").bind(name).first();
    if (dupe) return json({ error: "name already taken" }, 409);
    const { salt, hash } = await hashPassword(b.password);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const res = await env.DB.prepare(
      "INSERT INTO users (name, email, status, pass_salt, pass_hash, created_at, joined_via_invite, verify_code, verify_expires) " +
        "VALUES (?, ?, 'unverified', ?, ?, ?, ?, ?, ?) RETURNING id"
    ).bind(name, email, salt, hash, new Date().toISOString(), autoIn ? 1 : 0, code,
      new Date(Date.now() + 30 * 60_000).toISOString()).first<{ id: number }>();
    await env.DB.prepare("INSERT INTO user_settings (user_id, key, value) VALUES (?, 'ntfy_topic', ?)")
      .bind(res!.id, genNtfyTopic()).run();
    // Only the registrant hears about this — the admin isn't pinged until the email is proven real.
    ctx.waitUntil(notifyVerifyCode(env, name, email, code));
    return json({ ok: true, verify: true, message: "We emailed you a 6-digit code — enter it below." });
  }

  // POST /api/resend {email} — fresh verification code for an unverified account.
  if (path === "/api/resend" && method === "POST") {
    const b = (await req.json().catch(() => ({}))) as { email?: string };
    const u = await env.DB.prepare("SELECT id, name, email FROM users WHERE lower(email) = lower(?) AND status = 'unverified'")
      .bind((b.email ?? "").trim()).first<{ id: number; name: string; email: string }>();
    // Always answer OK so this can't be used to probe which emails exist.
    if (u) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await env.DB.prepare("UPDATE users SET verify_code = ?, verify_expires = ? WHERE id = ?")
        .bind(code, new Date(Date.now() + 30 * 60_000).toISOString(), u.id).run();
      ctx.waitUntil(notifyVerifyCode(env, u.name, u.email, code));
    }
    return json({ ok: true, message: "If that address has an unverified signup, a new code is on its way." });
  }

  // POST /api/verify {email, code} — proves the address; then fast-pass in or queue for approval.
  if (path === "/api/verify" && method === "POST") {
    const b = (await req.json().catch(() => ({}))) as { email?: string; code?: string };
    const u = await env.DB.prepare("SELECT * FROM users WHERE lower(email) = lower(?) AND status = 'unverified'")
      .bind((b.email ?? "").trim()).first<User & { verify_code: string | null; verify_expires: string | null }>();
    if (!u || !u.verify_code || u.verify_code !== (b.code ?? "").trim()) return json({ error: "wrong code" }, 400);
    if (!u.verify_expires || Date.parse(u.verify_expires) < Date.now()) {
      return json({ error: "code expired — sign up again to get a new one" }, 400);
    }
    const adminSettings = await loadSettings(env, 1);
    if (u.joined_via_invite) {
      await env.DB.prepare("UPDATE users SET status = 'active', verify_code = NULL, verify_expires = NULL WHERE id = ?")
        .bind(u.id).run();
      ctx.waitUntil(
        Promise.all([
          notifyApproved(env, u.name, u.email),
          (async () => {
            const { sendAlert } = await import("./ntfy");
            await sendAlert(adminSettings.ntfy_topic || env.NTFY_TOPIC, "New member joined (invite code)",
              `${u.name} <${u.email}> is in — no approval needed`, env.APP_URL, adminSettings.ntfy_server).catch(() => {});
          })(),
        ])
      );
      const sid = await makeSession(secret, u.id);
      return json({ ok: true }, 200, { "set-cookie": setCookie(sid) });
    }
    await env.DB.prepare("UPDATE users SET status = 'pending', verify_code = NULL, verify_expires = NULL WHERE id = ?")
      .bind(u.id).run();
    ctx.waitUntil(
      Promise.all([
        notifySignup(env, u.name, u.email!, adminSettings.ntfy_topic || env.NTFY_TOPIC, adminSettings.ntfy_server),
        notifyPending(env, u.name, u.email!),
      ])
    );
    return json({ ok: true, pending: true, message: "Email verified — the admin will review your request. Watch your inbox." });
  }

  if (path === "/api/login" && method === "POST") {
    const b = (await req.json().catch(() => ({}))) as { name?: string; password?: string };
    const handle = (b.name ?? "").trim();
    const user = await env.DB.prepare("SELECT * FROM users WHERE lower(name) = lower(?) OR lower(email) = lower(?)")
      .bind(handle, handle)
      .first<User>();
    if (!user || !(await verifyPassword(b.password ?? "", user.pass_salt, user.pass_hash))) {
      return json({ error: "wrong name or password" }, 401);
    }
    if (user.status === "unverified") return json({ error: "email not verified — sign up again to get a fresh code" }, 403);
    if (user.status === "pending") return json({ error: "account not approved yet — watch your email" }, 403);
    const sid = await makeSession(secret, user.id);
    return json({ ok: true }, 200, { "set-cookie": setCookie(sid) });
  }

  if (path === "/api/logout" && method === "POST") {
    return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0` });
  }

  // ---- everything below requires a session ----
  if (!userId) return json({ error: "unauthorized" }, 401);
  const user = await getUser(env, userId);
  if (!user || user.status === "pending" || user.status === "unverified") return json({ error: "unauthorized" }, 401);

  if (user.status === "revoked") {
    if (path === "/api/state" && method === "GET") {
      const deleteBy = user.revoked_at
        ? new Date(new Date(user.revoked_at).getTime() + 7 * 86_400_000).toISOString().slice(0, 10)
        : null;
      return json({ revoked: true, reason: user.revoke_reason || "not specified", deleteBy, user: { name: user.name } });
    }
    if (path === "/api/account/delete" && method === "POST") {
      const b = (await req.json().catch(() => ({}))) as { password?: string };
      if (!(await verifyPassword(b.password ?? "", user.pass_salt, user.pass_hash))) return json({ error: "wrong password" }, 401);
      await env.DB.batch([
        env.DB.prepare("DELETE FROM user_steps WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM user_notes WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM user_settings WHERE user_id = ?").bind(user.id),
        env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id),
      ]);
      return json({ ok: true, deleted: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0` });
    }
    if (path === "/api/logout" && method === "POST") {
      return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0` });
    }
    return json({ error: "account disabled" }, 403);
  }

  // ---- admin (user 1 only) ----
  if (path.startsWith("/api/admin/")) {
    if (user.id !== 1) return json({ error: "forbidden" }, 403);
    if (path === "/api/admin/users" && method === "GET") {
      const rows = (await env.DB.prepare(
        "SELECT u.id, u.name, u.email, u.status, u.created_at, " +
        "(SELECT COUNT(*) FROM user_steps s WHERE s.user_id = u.id) AS done_steps, " +
        "(SELECT MAX(done_at) FROM user_steps s WHERE s.user_id = u.id) AS last_active " +
        "FROM users u ORDER BY u.id"
      ).all()).results ?? [];
      const inviteUsed = await env.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE joined_via_invite = 1").first<{ n: number }>();
      return json({ users: rows, maxUsers: MAX_USERS, invite: env.INVITE_CODE ?? null, inviteUsed: inviteUsed?.n ?? 0, inviteMax: INVITE_MAX_USES });
    }
    const del = path.match(/^\/api\/admin\/users\/(\d+)$/);
    if (del && method === "DELETE") {
      const target = Number(del[1]);
      if (target === 1) return json({ error: "cannot delete the admin account" }, 400);
      await env.DB.batch([
        env.DB.prepare("DELETE FROM user_steps WHERE user_id = ?").bind(target),
        env.DB.prepare("DELETE FROM user_notes WHERE user_id = ?").bind(target),
        env.DB.prepare("DELETE FROM user_settings WHERE user_id = ?").bind(target),
        env.DB.prepare("DELETE FROM users WHERE id = ?").bind(target),
      ]);
      return json({ ok: true });
    }

    const st = path.match(/^\/api\/admin\/users\/(\d+)\/status$/);
    if (st && method === "POST") {
      const target = Number(st[1]);
      if (target === 1) return json({ error: "cannot change the admin account" }, 400);
      const b = (await req.json().catch(() => ({}))) as { status?: string; reason?: string };
      if (!["active", "revoked", "pending"].includes(b.status ?? "")) return json({ error: "bad status" }, 400);
      const t = await getUser(env, target);
      if (!t) return json({ error: "no such user" }, 404);
      const wasRevoked = t.status === "revoked";
      if (b.status === "revoked") {
        await env.DB.prepare("UPDATE users SET status = 'revoked', revoke_reason = ?, revoked_at = ? WHERE id = ?")
          .bind((b.reason || "not specified").slice(0, 200), new Date().toISOString(), target)
          .run();
        if (!wasRevoked) ctx.waitUntil(notifyRevoked(env, t.name, t.email, b.reason));
      } else {
        await env.DB.prepare("UPDATE users SET status = ?, revoke_reason = NULL, revoked_at = NULL WHERE id = ?")
          .bind(b.status, target)
          .run();
        if (b.status === "active" && t.status !== "active") ctx.waitUntil(notifyApproved(env, t.name, t.email));
      }
      return json({ ok: true });
    }
    return json({ error: "not found" }, 404);
  }

  if (path === "/api/state" && method === "GET") return json(await getState(env, user));

  if (path === "/api/leaderboard" && method === "GET") return json({ board: await leaderboard(env) });

  const toggle = path.match(/^\/api\/steps\/([\w.-]+)\/toggle$/);
  if (toggle && method === "POST") {
    const id = decodeURIComponent(toggle[1]);
    const b = (await req.json().catch(() => ({}))) as { done?: boolean };
    if (b.done) {
      await env.DB.prepare("INSERT OR REPLACE INTO user_steps (user_id, step_id, done_at) VALUES (?, ?, ?)")
        .bind(userId, id, new Date().toISOString())
        .run();
    } else {
      await env.DB.prepare("DELETE FROM user_steps WHERE user_id = ? AND step_id = ?").bind(userId, id).run();
    }
    return json(await getState(env, user));
  }

  if (path === "/api/settings" && method === "PUT") {
    const b = (await req.json().catch(() => ({}))) as Record<string, string>;
    const allowed = ["start_date", "session_minutes", "study_days", "reminder_enabled", "timezone", "ntfy_topic", "ntfy_server"];
    const stmts = [];
    for (const k of allowed) {
      if (b[k] !== undefined) {
        stmts.push(
          env.DB.prepare(
            "INSERT INTO user_settings (user_id, key, value) VALUES (?, ?, ?) " +
              "ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value"
          ).bind(userId, k, String(b[k]))
        );
      }
    }
    if (stmts.length) await env.DB.batch(stmts);
    return json(await getState(env, user));
  }

  // PUT /api/github {token?, owner, repo, branch?} — token stored encrypted, never returned
  if (path === "/api/github" && method === "PUT") {
    const b = (await req.json().catch(() => ({}))) as { token?: string; owner?: string; repo?: string; branch?: string };
    if (!b.owner || !b.repo) return json({ error: "owner and repo required" }, 400);
    const enc = b.token ? await encryptToken(secret, b.token.trim()) : user.gh_token_enc;
    if (!enc) return json({ error: "a GitHub token is required the first time" }, 400);
    await env.DB.prepare("UPDATE users SET gh_token_enc = ?, gh_owner = ?, gh_repo = ?, gh_branch = ? WHERE id = ?")
      .bind(enc, b.owner.trim(), b.repo.trim(), (b.branch ?? "master").trim(), userId)
      .run();
    const fresh = await getUser(env, userId);
    return json(await getState(env, fresh!));
  }

  // POST /api/account/delete {password} — permanent self-service deletion.
  if (path === "/api/account/delete" && method === "POST") {
    if (user.id === 1) return json({ error: "the admin account cannot delete itself" }, 400);
    const b = (await req.json().catch(() => ({}))) as { password?: string };
    if (!(await verifyPassword(b.password ?? "", user.pass_salt, user.pass_hash))) {
      return json({ error: "wrong password" }, 401);
    }
    await env.DB.batch([
      env.DB.prepare("DELETE FROM user_steps WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM user_notes WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM user_settings WHERE user_id = ?").bind(user.id),
      env.DB.prepare("DELETE FROM users WHERE id = ?").bind(user.id),
    ]);
    return json({ ok: true, deleted: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0` });
  }

  const note = path.match(/^\/api\/notes\/([\w-]+)$/);
  if (note && method === "PUT") {
    const weekId = note[1];
    const b = (await req.json().catch(() => ({}))) as { body?: string; push?: boolean };
    const text = (b.body ?? "").trim();
    if (!text) return json({ error: "note is empty" }, 400);
    await env.DB.prepare(
      "INSERT INTO user_notes (user_id, week_id, body, updated_at) VALUES (?, ?, ?, ?) " +
        "ON CONFLICT(user_id, week_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at"
    ).bind(userId, weekId, text, new Date().toISOString()).run();

    let pushed = false, commitUrl = "", error = "";
    if (b.push) {
      const gh = await ghEnvFor(env, user);
      if (!githubConfigured(gh)) error = "GitHub not configured — add your token in Settings. Saved locally.";
      else {
        try {
          const res = await commitFile(gh, `notes/${weekId}.md`, text + "\n", `notes(${weekId}): update learning note`);
          pushed = true;
          commitUrl = res.commitUrl;
          const sid = noteStepId(weekId);
          if (sid) {
            await env.DB.prepare("INSERT OR REPLACE INTO user_steps (user_id, step_id, done_at) VALUES (?, ?, ?)")
              .bind(userId, sid, new Date().toISOString())
              .run();
          }
        } catch (err) {
          error = (err as Error)?.message ?? "push failed";
        }
      }
    }
    return json({ saved: true, pushed, commitUrl, error, ...(await getState(env, user)) });
  }

  if (path === "/api/test-reminder" && method === "POST") {
    const { plan, settings: st } = await getState(env, user);
    const topic = st.ntfy_topic || (user.id === 1 ? env.NTFY_TOPIC : undefined);
    if (!topic) return json({ sent: false, error: "set your ntfy topic in Settings first" });
    const ok = await sendSessionPush(topic, plan, env.APP_URL, st.ntfy_server);
    return json({ sent: ok });
  }

  return json({ error: "not found" }, 404);
}

/* ---------------- login page ---------------- */

const LOGIN_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in — AI Curriculum</title>
<style>:root{color-scheme:dark}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;background:#0e0f12;color:#e7e9ec;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px;box-sizing:border-box}
.card{background:#16181d;padding:26px;border-radius:14px;border:1px solid #262a31;width:min(92vw,360px)}
h1{font-size:16px;margin:0 0 18px;letter-spacing:-0.01em}
input{width:100%;padding:11px 12px;border-radius:8px;border:1px solid #333842;background:#0e0f12;color:#e7e9ec;box-sizing:border-box;font:inherit;margin-bottom:9px}
input:focus{outline:2px solid rgba(123,135,232,.45);outline-offset:-1px}
button{width:100%;padding:11px;border:0;border-radius:8px;background:#7b87e8;color:#fff;font-weight:600;cursor:pointer;font:inherit}
button:hover{background:#8b96f0}.err{color:#d98a7a;font-size:13px;min-height:18px;margin:6px 0 0}
.alt{margin-top:16px;padding-top:14px;border-top:1px solid #262a31;font-size:13px;color:#9aa1ab;text-align:center}
.alt a{color:#7b87e8;cursor:pointer;text-decoration:none}.alt a:hover{text-decoration:underline}.hide{display:none}</style></head>
<body><div class="card">
<form id="f-login" onsubmit="return go(event,'login')"><h1>AI Curriculum — sign in</h1>
<input id="li-name" placeholder="Name or email" autocomplete="username" autofocus>
<input id="li-pass" type="password" placeholder="Password" autocomplete="current-password">
<button>Sign in</button><div class="err" id="e1"></div>
<p class="alt">New here? <a onclick="flip(true)">Join the study group</a> \u00b7 <a onclick="showVerify()">Have a code?</a></p></form>
<form id="f-reg" class="hide" onsubmit="return go(event,'register')"><h1>Join the study group</h1>
<p style="font-size:12.5px;color:#9aa1ab;margin:0 0 10px">Have an invite code? You're in instantly. No code? Sign up anyway — the admin approves requests, watch your email.</p>
<p style="font-size:12px;color:#e0a54e;margin:0 0 10px">\u26a0 Use a real email you actually read — we verify it with a code, and approvals, reminders, and account notices all go there.</p>
<input id="r-invite" placeholder="Invite code (optional — instant access)">
<input id="r-name" placeholder="Display name (shown on the leaderboard)" autocomplete="username">
<input id="r-email" type="email" placeholder="Email (so the admin knows who you are)" autocomplete="email">
<input id="r-pass" type="password" placeholder="Choose a password (6+ chars)" autocomplete="new-password">
<button>Create account</button><div class="err" id="e2"></div>
<p class="alt">Already joined? <a onclick="flip(false)">Sign in</a></p></form>
<form id="f-verify" class="hide" onsubmit="return doVerify(event)"><h1>Check your email</h1>
<p style="font-size:12.5px;color:#9aa1ab;margin:0 0 10px">We sent a 6-digit code to your email (check spam too). It expires in 30 minutes.</p>
<input id="v-email" type="email" placeholder="Your email" autocomplete="email">
<input id="v-code" inputmode="numeric" placeholder="6-digit code" maxlength="6">
<button>Verify</button>
<p class="alt" style="margin-top:10px"><a onclick="resend()">Resend code</a> \u00b7 <a onclick="flip(false)">Back to sign in</a></p>
<div class="err" id="e3"></div></form>
</div><script>
function flip(reg){document.getElementById('f-login').classList.toggle('hide',reg);document.getElementById('f-reg').classList.toggle('hide',!reg);document.getElementById('f-verify').classList.add('hide')}
function showVerify(){['f-login','f-reg'].forEach(i=>document.getElementById(i).classList.add('hide'));document.getElementById('f-verify').classList.remove('hide')}
async function resend(){const em=val('v-email');if(!em){document.getElementById('e3').textContent='enter your email first';return}
await fetch('/api/resend',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:em})});
const e=document.getElementById('e3');e.style.color='#5fb98a';e.textContent='New code sent — check your inbox.'}
async function doVerify(ev){ev.preventDefault();
const r=await fetch('/api/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:val('v-email'),code:val('v-code')})});
const d=await r.json().catch(()=>({}));
if(r.ok&&d.pending){const e=document.getElementById('e3');e.style.color='#5fb98a';e.textContent=d.message}
else if(r.ok){location.reload()}
else{document.getElementById('e3').textContent=d.error||'failed'}return false}
async function go(ev,mode){ev.preventDefault();
const body=mode==='login'?{name:val('li-name'),password:val('li-pass')}:{invite:val('r-invite'),name:val('r-name'),email:val('r-email'),password:val('r-pass')};
const r=await fetch('/api/'+mode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
const d=await r.json().catch(()=>({}));
if(r.ok&&d.verify){document.getElementById('f-reg').classList.add('hide');document.getElementById('f-verify').classList.remove('hide');document.getElementById('v-email').value=val('r-email')}
else if(r.ok&&d.pending){const e=document.getElementById('e2');e.style.color='#5fb98a';e.textContent=d.message||'Created — waiting for admin approval.'}
else if(r.ok){location.reload()}
else{document.getElementById(mode==='login'?'e1':'e2').textContent=d.error||'failed'}return false}
function val(id){return document.getElementById(id).value}
</script></body></html>`;

/* ---------------- entry ---------------- */

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const userId = await readSession(env.ACCESS_PASSWORD!, getCookie(req, COOKIE));

    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(req, env, url, userId, ctx);
      } catch (err) {
        console.error("api error:", (err as Error)?.message ?? err);
        return json({ error: "internal error" }, 500);
      }
    }
    if (!userId) {
      return new Response(LOGIN_HTML, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    }
    const u = await getUser(env, userId);
    if (!u || u.status === "pending" || u.status === "unverified") {
      return new Response(LOGIN_HTML, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return env.ASSETS.fetch(req);
  },

  // Daily reminder — pushes each active user's current session to their own ntfy topic.
  async scheduled(_e: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        // purge unverified signups older than 48h (fake/typo emails)
        await env.DB.prepare(
          "DELETE FROM user_settings WHERE user_id IN (SELECT id FROM users WHERE status='unverified' AND created_at < datetime('now','-2 days'))"
        ).run();
        await env.DB.prepare("DELETE FROM users WHERE status='unverified' AND created_at < datetime('now','-2 days')").run();

        // purge revoked accounts one week after the revocation email
        const cutoff = new Date(Date.now() - 7 * 86_400_000).toISOString();
        const stale = (await env.DB.prepare(
          "SELECT id FROM users WHERE status = 'revoked' AND revoked_at IS NOT NULL AND revoked_at < ?"
        ).bind(cutoff).all<{ id: number }>()).results ?? [];
        for (const s of stale) {
          await env.DB.batch([
            env.DB.prepare("DELETE FROM user_steps WHERE user_id = ?").bind(s.id),
            env.DB.prepare("DELETE FROM user_notes WHERE user_id = ?").bind(s.id),
            env.DB.prepare("DELETE FROM user_settings WHERE user_id = ?").bind(s.id),
            env.DB.prepare("DELETE FROM users WHERE id = ?").bind(s.id),
          ]);
          console.log(`purged revoked user ${s.id} (7-day window elapsed)`);
        }

        // inactivity policy: warn at 7 days idle, auto-disable at 14 (admin exempt).
        const DAY = 86_400_000;
        const now = Date.now();
        const actives = (await env.DB.prepare(
          "SELECT u.id, u.name, u.email, u.created_at, u.last_nudge_at, " +
          "(SELECT MAX(done_at) FROM user_steps s WHERE s.user_id = u.id) AS last_step, " +
          "(SELECT MAX(updated_at) FROM user_notes n WHERE n.user_id = u.id) AS last_note " +
          "FROM users u WHERE u.status = 'active' AND u.id != 1"
        ).all<{ id: number; name: string; email: string | null; created_at: string; last_nudge_at: string | null; last_step: string | null; last_note: string | null }>()).results ?? [];
        for (const a of actives) {
          const lastActive = Math.max(
            Date.parse(a.created_at || "") || 0,
            Date.parse(a.last_step || "") || 0,
            Date.parse(a.last_note || "") || 0
          );
          if (!lastActive) continue;
          const idleDays = Math.floor((now - lastActive) / DAY);
          if (idleDays >= 14) {
            await env.DB.prepare(
              "UPDATE users SET status = 'revoked', revoke_reason = ?, revoked_at = ? WHERE id = ?"
            ).bind("Inactivity — no activity for 2 weeks", new Date().toISOString(), a.id).run();
            await notifyRevoked(env, a.name, a.email, "Inactivity — no activity for 2 weeks");
            console.log(`auto-disabled user ${a.id} (${idleDays}d idle)`);
          } else if (idleDays >= 7) {
            const lastNudge = Date.parse(a.last_nudge_at || "") || 0;
            // nudge once per idle spell (re-nudge only if they were active since, or 7d passed)
            if (lastNudge < lastActive || now - lastNudge >= 7 * DAY) {
              await notifyInactive(env, a.name, a.email, idleDays);
              await env.DB.prepare("UPDATE users SET last_nudge_at = ? WHERE id = ?")
                .bind(new Date().toISOString(), a.id).run();
              console.log(`nudged user ${a.id} (${idleDays}d idle)`);
            }
          }
        }

        const users = (await env.DB.prepare("SELECT id FROM users WHERE status = 'active'").all<{ id: number }>())
          .results ?? [];
        for (const u of users) {
          const settings = await loadSettings(env, u.id);
          const topic = settings.ntfy_topic || (u.id === 1 ? env.NTFY_TOPIC : undefined);
          if (!topic) continue;
          if ((settings.reminder_enabled ?? "1") === "0") continue;
          const studyDays = settings.study_days.split(",").map((x) => parseInt(x, 10));
          if (!studyDays.includes(new Date().getUTCDay())) continue;
          const done = await loadDone(env, u.id);
          const plan = computePlan(done, settings, Date.now());
          await sendSessionPush(topic, plan, env.APP_URL, settings.ntfy_server);
        }
      })()
    );
  },
};
