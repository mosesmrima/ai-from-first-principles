// One-time helper: mint a Gmail refresh token via the OAuth loopback flow.
//   node scripts/mint-gmail-token.mjs <client_id> <client_secret>
// Prints the auth URL, catches the redirect on localhost, prints the refresh token.
import http from "node:http";
import crypto from "node:crypto";

const [clientId, clientSecret] = process.argv.slice(2);
if (!clientId || !clientSecret) {
  console.error("usage: node scripts/mint-gmail-token.mjs <client_id> <client_secret>");
  process.exit(1);
}

const PORT = 8765;
const REDIRECT = `http://localhost:${PORT}/`;
const SCOPE = "https://www.googleapis.com/auth/gmail.send";
const state = crypto.randomBytes(8).toString("hex");

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== "/") { res.writeHead(404).end(); return; }
  const code = url.searchParams.get("code");
  if (url.searchParams.get("state") !== state || !code) {
    res.writeHead(400).end("Bad request"); return;
  }
  res.writeHead(200, { "content-type": "text/html" })
     .end("<h2>Done — you can close this tab and go back to the terminal.</h2>");
  server.close();
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: REDIRECT, grant_type: "authorization_code",
    }),
  });
  const j = await r.json();
  if (!j.refresh_token) { console.error("No refresh token returned:", j); process.exit(1); }
  console.log("\nREFRESH_TOKEN=" + j.refresh_token + "\n");
  process.exit(0);
});

server.listen(PORT, () => {
  console.log("\n1. Open this URL in your browser (sign in as the gmail you want to send from):\n");
  console.log(authUrl + "\n");
  console.log("2. Approve. If you see 'Google hasn't verified this app', click Advanced -> Continue.");
  console.log("3. This script will catch the redirect and print your refresh token.\n");
});
