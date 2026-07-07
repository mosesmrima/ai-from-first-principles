# AI Curriculum Tracker

A tiny, near-free web tracker for the `ai-from-first-principles` curriculum. Turns the
CLI `track.py` into a browser app with a **dated timetable**, a **checklist**, embedded
**resources (YouTube + courses + papers)**, and a **weekly email reminder**.

All Cloudflare, no AWS: **Worker** (API + static frontend) · **D1** (SQLite) · **Cron**
(weekly email) · **Email Sending** (reminders from your domain) · **Cloudflare Access**
(private, no login code) · optional **WhatsApp** (Meta Cloud API).

## Architecture

```
Browser ──> Worker (src/index.ts) ──> D1 (milestones, resources, settings)
               │  serves public/ (index.html, app.js, styles.css) via ASSETS
               └─ scheduled() weekly ──> env.EMAIL.send() reminder  (+ WhatsApp if configured)
```

- **Schedule engine** (`src/schedule.ts`): maps each curriculum week to a calendar week from
  a start date, inserts a "Review & buffer" week after each phase, and computes
  "you are here / N weeks behind / ahead". Pace + start date editable in the UI.
- **Data** is seeded from the curriculum's `../progress.json` (single source of truth) via
  `seed/generate-seed.mjs`.

## One-time setup (already done in this repo)

```bash
wrangler d1 create ai-tracker          # → database_id in wrangler.jsonc
node seed/generate-seed.mjs            # progress.json → seed/seed.sql
wrangler d1 execute ai-tracker --remote --file=./schema.sql
wrangler d1 execute ai-tracker --remote --file=./seed/seed.sql
wrangler deploy                        # uploads the Worker + bindings
```

## Finish going live (two remaining steps)

### 1. Give it a URL
Pick ONE:

**a) Free workers.dev subdomain** (fastest):
```bash
# register once (account-global name), then redeploy
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/workers/subdomain" \
  -H "Authorization: Bearer $CF_TOKEN" -H "content-type: application/json" \
  -d '{"subdomain":"YOURNAME"}'
wrangler deploy      # → https://ai-tracker.YOURNAME.workers.dev
```

**b) Custom domain** (only for a domain that is a zone in THIS Cloudflare account):
```jsonc
// wrangler.jsonc
"routes": [{ "pattern": "track.yourdomain.com", "custom_domain": true }]
```
```bash
wrangler deploy
```

### 2. Lock it to just you (Cloudflare Access, free)
Zero Trust → Access → Applications → Add self-hosted app → your URL → policy: allow
email `mrimamss@gmail.com`. No login code needed; Access sits in front of the Worker.

## Email reminders

Uses the Cloudflare **Email Sending** binding (`env.EMAIL.send`). Onboard the sending domain once:
```bash
wrangler email sending enable <yourdomain.com>     # adds SPF/DKIM to that zone
```
Update `FROM_EMAIL` in `wrangler.jsonc` to `something@<yourdomain.com>` and redeploy.
Test from the app: **Settings → Send test email now**, or:
```bash
curl -X POST https://<your-url>/api/test-reminder
```
Cron fires Mondays 07:00 UTC (`triggers.crons` in wrangler.jsonc).

## WhatsApp (optional add-on)

Set Meta WhatsApp Cloud API secrets, then the weekly cron also sends a WhatsApp nudge:
```bash
wrangler secret put WHATSAPP_TOKEN       # Meta permanent access token
wrangler secret put WHATSAPP_PHONE_ID    # WhatsApp Business phone number ID
wrangler secret put WHATSAPP_TO          # your number, e.g. 2547XXXXXXXX
```

## API

| Method | Path | Body | Purpose |
|---|---|---|---|
| GET | `/api/state` | — | milestones + settings + resources + computed schedule |
| POST | `/api/milestones/:id/toggle` | `{done}` | mark a week/capstone done |
| PUT | `/api/settings` | `{start_date, pace_weeks_per_slot, buffer_per_phase, reminder_enabled}` | reshape the timetable |
| POST | `/api/resources` | `{scope, ref, title, url}` | pin your own link (YouTube auto-embeds) |
| DELETE | `/api/resources/:id` | — | remove a pinned link |
| POST | `/api/test-reminder` | — | send the weekly email now |

## Local dev

```bash
wrangler d1 execute ai-tracker --local --file=./schema.sql
wrangler d1 execute ai-tracker --local --file=./seed/seed.sql
wrangler dev
```

## Re-seed after editing the curriculum

`progress.json` changed? Regenerate and re-apply:
```bash
node seed/generate-seed.mjs
wrangler d1 execute ai-tracker --remote --file=./seed/seed.sql   # NOTE: resets done-state
```
(The seed's leading `DELETE`s reset progress — for a non-destructive milestone update, edit
rows directly instead.)
