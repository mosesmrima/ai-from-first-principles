// Send email via AWS SES v2 from a Cloudflare Worker, signed with SigV4 (Web Crypto).
// No AWS SDK needed. Credentials come from Worker secrets.

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function sha256hex(data: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)));
}
async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data));
}

export interface SesEnv {
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}

export interface SesMessage {
  from: string; // "Name <addr@domain>" or "addr@domain"
  to: string;
  subject: string;
  html: string;
  text: string;
}

export function sesConfigured(env: SesEnv): boolean {
  return !!(env.AWS_REGION && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);
}

export async function sendViaSES(env: SesEnv, msg: SesMessage): Promise<{ ok: boolean; status: number; body?: string }> {
  const region = env.AWS_REGION!;
  const service = "ses";
  const host = `email.${region}.amazonaws.com`;
  const path = "/v2/email/outbound-emails";
  const method = "POST";

  const payload = JSON.stringify({
    FromEmailAddress: msg.from,
    Destination: { ToAddresses: [msg.to] },
    Content: {
      Simple: {
        Subject: { Data: msg.subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: msg.html, Charset: "UTF-8" },
          Text: { Data: msg.text, Charset: "UTF-8" },
        },
      },
    },
  });

  const now = new Date();
  const amzdate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const datestamp = amzdate.slice(0, 8);
  const payloadHash = await sha256hex(payload);

  const canonicalHeaders =
    `content-type:application/json\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzdate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [method, path, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const scope = `${datestamp}/${region}/${service}/aws4_request`;
  const stringToSign = [algorithm, amzdate, scope, await sha256hex(canonicalRequest)].join("\n");

  const kDate = await hmac(new TextEncoder().encode("AWS4" + env.AWS_SECRET_ACCESS_KEY), datestamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const signature = hex(await hmac(kSigning, stringToSign));

  const authorization =
    `${algorithm} Credential=${env.AWS_ACCESS_KEY_ID}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-amz-date": amzdate,
      "x-amz-content-sha256": payloadHash,
      authorization,
    },
    body: payload,
  });
  const body = res.ok ? undefined : await res.text();
  return { ok: res.ok, status: res.status, body };
}
