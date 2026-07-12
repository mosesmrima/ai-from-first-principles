// Send email as the admin's Gmail account via the Gmail REST API.
// Auth: OAuth2 refresh token (minted once, stored as Worker secrets).
// Free, no domain needed, and mail genuinely originates from Google's servers
// so deliverability is perfect.

export interface GmailEnv {
  GMAIL_CLIENT_ID?: string;
  GMAIL_CLIENT_SECRET?: string;
  GMAIL_REFRESH_TOKEN?: string;
  FROM_EMAIL?: string; // the gmail address itself
}

export function gmailConfigured(env: GmailEnv): boolean {
  return !!(env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN);
}

async function accessToken(env: GmailEnv): Promise<string> {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID!,
      client_secret: env.GMAIL_CLIENT_SECRET!,
      refresh_token: env.GMAIL_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!r.ok) throw new Error(`gmail token refresh failed (${r.status}): ${await r.text()}`);
  const j = (await r.json()) as { access_token: string };
  return j.access_token;
}

/** base64url for the RFC-822 message (UTF-8 safe). */
function b64url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** RFC 2047 encode a header value so non-ASCII subjects survive. */
function encHeader(s: string): string {
  return /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`;
}

export interface GmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  fromName?: string;
}

export async function sendViaGmail(env: GmailEnv, msg: GmailMessage): Promise<{ ok: boolean; status: number; body?: string }> {
  const token = await accessToken(env);
  const from = msg.fromName ? `${encHeader(msg.fromName)} <${env.FROM_EMAIL}>` : env.FROM_EMAIL!;
  const boundary = "b" + Math.random().toString(36).slice(2);

  const raw = msg.html
    ? [
        `From: ${from}`,
        `To: ${msg.to}`,
        `Subject: ${encHeader(msg.subject)}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        msg.text,
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "",
        msg.html,
        `--${boundary}--`,
      ].join("\r\n")
    : [
        `From: ${from}`,
        `To: ${msg.to}`,
        `Subject: ${encHeader(msg.subject)}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        msg.text,
      ].join("\r\n");

  const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ raw: b64url(raw) }),
  });
  return { ok: r.ok, status: r.status, body: r.ok ? undefined : await r.text() };
}
