// Auth primitives: PBKDF2 password hashing, HMAC-signed session cookies, and
// AES-GCM encryption for stored GitHub tokens. All WebCrypto, no dependencies.
// ACCESS_PASSWORD doubles as the server-side signing/encryption root secret.

const enc = new TextEncoder();

function hex(buf: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(buf as ArrayBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function unhex(s: string): Uint8Array {
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/* ---------------- passwords (PBKDF2-SHA256, 100k iters) ---------------- */

export async function hashPassword(password: string, saltHex?: string): Promise<{ salt: string; hash: string }> {
  const salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt.buffer as ArrayBuffer, iterations: 100_000 },
    key,
    256
  );
  return { salt: hex(salt), hash: hex(bits) };
}

export async function verifyPassword(password: string, saltHex: string, expectedHash: string): Promise<boolean> {
  const { hash } = await hashPassword(password, saltHex);
  // constant-time-ish compare
  if (hash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  return diff === 0;
}

/* ---------------- session cookies (HMAC-signed) ---------------- */

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode("session:" + secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function makeSession(secret: string, userId: number, days = 400): Promise<string> {
  const exp = Date.now() + days * 86_400_000;
  const payload = `${userId}.${exp}`;
  const sig = hex(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload)));
  return `${payload}.${sig}`;
}

export async function readSession(secret: string, cookie: string | null): Promise<number | null> {
  if (!cookie) return null;
  const parts = cookie.split(".");
  if (parts.length !== 3) return null;
  const [uid, exp, sig] = parts;
  if (Date.now() > Number(exp)) return null;
  const ok = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret),
    unhex(sig).buffer as ArrayBuffer,
    enc.encode(`${uid}.${exp}`)
  );
  return ok ? Number(uid) : null;
}

/* ---------------- token encryption (AES-256-GCM) ---------------- */

async function aesKey(secret: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode("tokenkey:" + secret));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptToken(secret: string, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(secret), enc.encode(plaintext));
  return hex(iv) + ":" + hex(ct);
}

export async function decryptToken(secret: string, stored: string): Promise<string> {
  const [ivHex, ctHex] = stored.split(":");
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unhex(ivHex).buffer as ArrayBuffer },
    await aesKey(secret),
    unhex(ctHex).buffer as ArrayBuffer
  );
  return new TextDecoder().decode(pt);
}
