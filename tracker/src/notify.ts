// Membership notifications: email members on approve/revoke (via SES, if AWS
// secrets are set) and ping the admin's ntfy topic on new signups. Everything
// here is best-effort — a notification failure must never break the request.
import { sendViaSES, sesConfigured } from "./ses";

export interface NotifyEnv {
  APP_URL?: string;
  NTFY_TOPIC?: string;
  ADMIN_EMAIL?: string;
  FROM_EMAIL?: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}

const FOOTER = "\n\n— AI From First Principles study group";

const TEMPLATES = {
  approved: (name: string, appUrl: string) => ({
    subject: "You're in — your study-group account is approved",
    text:
      `Hi ${name},\n\n` +
      `Your account on the AI curriculum tracker has been approved. You can sign in now:\n\n` +
      `${appUrl}\n\n` +
      `Getting started:\n` +
      `1. Sign in and open the Now tab — it always shows your next step.\n` +
      `2. Fork the starter repo (link in Settings) and clone your fork.\n` +
      `3. Run bash setup.sh inside it, then start Week 0.\n\n` +
      `See you on the leaderboard.` + FOOTER,
  }),
  revoked: (name: string) => ({
    subject: "Your study-group access has been paused",
    text:
      `Hi ${name},\n\n` +
      `Your access to the AI curriculum tracker has been revoked by the admin — usually ` +
      `because the account looked inactive. Your progress is kept, nothing is deleted.\n\n` +
      `If you want back in, just reply to this email.` + FOOTER,
  }),
  signupAlert: (name: string, email: string, appUrl: string) => ({
    subject: `New signup pending approval: ${name}`,
    text:
      `${name} <${email}> just registered on the tracker and is waiting for approval.\n\n` +
      `Approve or revoke in Settings → Admin: ${appUrl}` + FOOTER,
  }),
};

function htmlWrap(text: string): string {
  return (
    '<div style="font-family:-apple-system,Segoe UI,system-ui,sans-serif;font-size:14px;line-height:1.6;color:#1b1e24;max-width:540px">' +
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>") +
    "</div>"
  );
}

async function sendEmail(env: NotifyEnv, to: string, subject: string, text: string): Promise<boolean> {
  if (!sesConfigured(env)) {
    console.log(`email skipped (SES not configured): "${subject}" -> ${to}`);
    return false;
  }
  const from = `AI Curriculum <${env.FROM_EMAIL || env.ADMIN_EMAIL || "noreply@example.com"}>`;
  const res = await sendViaSES(env, { from, to, subject, text, html: htmlWrap(text) });
  if (!res.ok) console.error(`email failed (${res.status}): ${res.body}`);
  return res.ok;
}

/** Member approved — email them the good news. */
export async function notifyApproved(env: NotifyEnv, name: string, email: string | null): Promise<void> {
  if (!email) return;
  const t = TEMPLATES.approved(name, env.APP_URL || "");
  await sendEmail(env, email, t.subject, t.text).catch(() => {});
}

/** Member revoked — email them, kindly. */
export async function notifyRevoked(env: NotifyEnv, name: string, email: string | null): Promise<void> {
  if (!email) return;
  const t = TEMPLATES.revoked(name);
  await sendEmail(env, email, t.subject, t.text).catch(() => {});
}

/** New signup — email the admin AND push to the admin's phone via ntfy. */
export async function notifySignup(env: NotifyEnv, name: string, email: string, adminTopic?: string, adminServer?: string): Promise<void> {
  const t = TEMPLATES.signupAlert(name, email, env.APP_URL || "");
  const { sendAlert } = await import("./ntfy");
  await Promise.all([
    env.ADMIN_EMAIL ? sendEmail(env, env.ADMIN_EMAIL, t.subject, t.text).catch(() => {}) : Promise.resolve(),
    sendAlert(adminTopic, "New signup pending approval", `${name} <${email}> — approve in Settings → Admin`, env.APP_URL, adminServer).catch(() => {}),
  ]);
}
