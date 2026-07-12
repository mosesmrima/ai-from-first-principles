// Membership notifications: email members on approve/revoke (via SES, if AWS
// secrets are set) and ping the admin's ntfy topic on new signups. Everything
// here is best-effort — a notification failure must never break the request.
import { sendViaSES, sesConfigured } from "./ses";
import { sendViaGmail, gmailConfigured } from "./gmail";

export interface NotifyEnv {
  APP_URL?: string;
  NTFY_TOPIC?: string;
  ADMIN_EMAIL?: string;
  FROM_EMAIL?: string;
  GMAIL_CLIENT_ID?: string;
  GMAIL_CLIENT_SECRET?: string;
  GMAIL_REFRESH_TOKEN?: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}

const FOOTER = "\n\n— AI From First Principles study group";

const TEMPLATES = {
  pendingConfirm: (name: string) => ({
    subject: "Got your signup — approval pending",
    text:
      `Hi ${name},\n\n` +
      `Thanks for signing up for the AI-from-first-principles study group. Your account is ` +
      `waiting for approval from the group admin.\n\n` +
      `No action needed from you — just watch this inbox. You'll get an email here the ` +
      `moment you're approved (usually within a day).` + FOOTER,
  }),
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
  revoked: (name: string, reason: string, appUrl: string) => ({
    subject: "Your study-group account has been disabled",
    text:
      `Hi ${name},\n\n` +
      `Your account on the AI curriculum tracker has been disabled.\n\n` +
      `Reason: ${reason || "not specified"}\n\n` +
      `What you can do:\n` +
      `\u2022 Appeal — just reply to this email and the admin will take a look.\n` +
      `\u2022 Delete your account and data yourself — sign in at ${appUrl} (you'll see a ` +
      `disabled-account page with a delete option).\n` +
      `\u2022 Or do nothing — no action is needed. Your account and data will be ` +
      `automatically deleted one week after this email.` + FOOTER,
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
  // Gmail is the primary channel (free, sends as the admin's real gmail).
  if (gmailConfigured(env)) {
    const res = await sendViaGmail(env, { to, subject, text, html: htmlWrap(text), fromName: "AI Curriculum" });
    if (!res.ok) console.error(`gmail send failed (${res.status}): ${res.body}`);
    return res.ok;
  }
  if (sesConfigured(env)) {
    const from = `AI Curriculum <${env.FROM_EMAIL || env.ADMIN_EMAIL || "noreply@example.com"}>`;
    const res = await sendViaSES(env, { from, to, subject, text, html: htmlWrap(text) });
    if (!res.ok) console.error(`ses send failed (${res.status}): ${res.body}`);
    return res.ok;
  }
  console.log(`email skipped (no email provider configured): "${subject}" -> ${to}`);
  return false;
}

/** Member approved — email them the good news. */
export async function notifyApproved(env: NotifyEnv, name: string, email: string | null): Promise<void> {
  if (!email) return;
  const t = TEMPLATES.approved(name, env.APP_URL || "");
  await sendEmail(env, email, t.subject, t.text).catch(() => {});
}

/** Member revoked — email them the reason and their options. */
export async function notifyRevoked(env: NotifyEnv, name: string, email: string | null, reason?: string): Promise<void> {
  if (!email) return;
  const t = TEMPLATES.revoked(name, reason || "", env.APP_URL || "");
  await sendEmail(env, email, t.subject, t.text).catch(() => {});
}

/** New registrant — confirm receipt and set expectations. */
export async function notifyPending(env: NotifyEnv, name: string, email: string): Promise<void> {
  const t = TEMPLATES.pendingConfirm(name);
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
