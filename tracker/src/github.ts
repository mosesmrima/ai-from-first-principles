// Commit a file straight to GitHub from the Worker via the Contents API.
// No git binary needed. Requires a fine-grained PAT with Contents: read+write
// on the target repo, stored as the GITHUB_TOKEN secret.

export interface GhEnv {
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
}

const API = "https://api.github.com";

export function githubConfigured(env: GhEnv): boolean {
  return !!(env.GITHUB_TOKEN && env.GITHUB_OWNER && env.GITHUB_REPO);
}

function ghHeaders(env: GhEnv): Record<string, string> {
  return {
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "user-agent": "ai-tracker",
    "x-github-api-version": "2022-11-28",
  };
}

/** UTF-8 safe base64 (btoa alone mangles non-ASCII). */
function b64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

const branchOf = (env: GhEnv) => env.GITHUB_BRANCH || "main";

/** Existing file's blob sha, or null if the file doesn't exist yet. */
async function getSha(env: GhEnv, path: string): Promise<string | null> {
  const url = `${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeURI(path)}?ref=${branchOf(env)}`;
  const r = await fetch(url, { headers: ghHeaders(env) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub GET ${r.status}: ${await r.text()}`);
  const j = (await r.json()) as { sha?: string };
  return j.sha ?? null;
}

export interface CommitResult {
  commitUrl: string;
  path: string;
}

/** Create or update `path` with `content`, producing one commit on the branch. */
export async function commitFile(
  env: GhEnv,
  path: string,
  content: string,
  message: string
): Promise<CommitResult> {
  const sha = await getSha(env, path); // null → create, else → update
  const url = `${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeURI(path)}`;
  const body: Record<string, unknown> = {
    message,
    content: b64(content),
    branch: branchOf(env),
  };
  if (sha) body.sha = sha;

  const r = await fetch(url, {
    method: "PUT",
    headers: { ...ghHeaders(env), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`GitHub PUT ${r.status}: ${await r.text()}`);
  const j = (await r.json()) as { commit?: { html_url?: string } };
  return { commitUrl: j.commit?.html_url ?? "", path };
}
