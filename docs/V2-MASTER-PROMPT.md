# Master prompt — build Study OS v2

> Give this entire prompt to the building agent as its goal. Everything it needs
> lives on this machine and on GitHub; paths below are absolute.

---

## Goal

Build **Study OS v2** — a full-fledged multi-user AI-learning platform (Next.js on Vercel + Supabase) that replaces the existing v1 tracker. It serves a 77-week "AI from first principles" curriculum for a small study group (currently 7 members, capped at 50). It is also a portfolio piece for the owner's Masters-in-AI application at CMU Africa — code quality, architecture, and polish all matter.

## Read these three sources FIRST, in this order

1. **The architecture spec (authoritative):** `/home/mrima/class/ai/docs/V2-ARCHITECTURE.md`
   ~955 lines. Contains the full Postgres schema (~25 tables with RLS policies), the YouTube watch-tracking protocol (interval-union crediting, auto-complete at ≥90%), per-book licensing verification for the embedded library, milestone plan M0–M5 (~230h), the D1→Supabase migration plan (forced password reset, <1h cutover), and every key technology decision (Resend for email, GitHub App instead of PATs, PDF.js for reading, pg_cron for schedules). **Where this prompt and that doc disagree, the doc wins.**

2. **The design (pixel-perfect target):** `/home/mrima/class/ai/design/study-os/`
   A Claude Design handoff bundle. Start with its `README.md`, then read `project/Screens.dc.html` top to bottom and follow its imports (`project/_ds/nocturne-*/styles.css` + `_ds_bundle.js` — the "Nocturne" design system tokens/components, `project/theme-light.css`, `project/support.js`, `project/data.js`, `project/icons.js`). Each screen also exists as its own file: `Today`, `VideoLesson`, `Library`, `Notes`, `Plan`, `Board`, `Profile`, `Settings`, `Admin`, `Auth`, `MobileChrome` (390px chrome), and `Study OS.dc.html` (fully clickable app). These are HTML/CSS/JS **prototypes**: recreate the visual output exactly in React/Tailwind (or CSS variables mirroring the Nocturne tokens); do not copy their internal structure. Dark mode is primary, light mode supported, inline SVG icons only (never emoji), `prefers-reduced-motion` respected, WCAG AA in both themes.

3. **The existing v1 system (business logic to carry forward):** `/home/mrima/class/ai/tracker/`
   A Cloudflare Worker + D1 app, live at https://ai-tracker.mrima.workers.dev with real users and real progress data. GitHub: `mosesmrima/ai-from-first-principles`, branch `main` (the tracker lives in `tracker/`). Key files:
   - `src/curriculum.ts` — **single source of truth for the curriculum**: 77 weeks + 8 recap weeks, steps with kinds (watch/read/build/paper/checkpoint/note), researched free-resource URLs (WEEK_LINKS), landmark papers (WEEK_PAPERS), honest time estimates. Port this data into the v2 database seed; do not invent curriculum content.
   - `src/guides.ts` — per-week "why this week matters / worth remembering" guides, including recap-week retrieval-practice framing.
   - `src/plan.ts` — the rolling step-queue model: the daily plan is driven by *completed steps*, not the calendar; a session queue fills to ~session_minutes and stays within the current week. Preserve this behavior.
   - `src/index.ts` — the full account lifecycle to preserve: register → email-verify (6-digit code) → invite fast-pass (capped uses) or admin approval → active; revoke-with-reason (revoked users can log in but only appeal/self-delete, auto-purge after 7 days); inactivity nudge at 7d, auto-revoke at 14d, purge at 21d; password reset via emailed code; admin panel; leaderboard.
   - `src/github.ts`, `src/notify.ts`, `src/ntfy.ts` — GitHub notes commits, email templates (tone/content to keep), ntfy push reminders (per-user `aitracker-<hex>` topics; keep ntfy support in v2 alongside email).
   - Step IDs in v1 are positional (`weekNN.i`) — the migration section of V2-ARCHITECTURE.md explains how to map them to stable v2 IDs without corrupting user progress.

## What v2 adds over v1 (the point of the rebuild)

- **Embedded video lessons**: YouTube IFrame API with segment (interval-union) watch tracking; a watch step shows real % watched and auto-completes at ≥90%. No trust-the-checkbox.
- **In-app library**: the 7 free textbooks and 12 landmark papers embedded via PDF.js (only from the official/licensed sources listed in the architecture doc), with per-book/paper reading progress that feeds step completion.
- **Rich notes editor**: TipTap with slash commands, code blocks, checklists, and LaTeX math; autosave + version history; "Publish to GitHub" via a GitHub App installation (replacing pasted PATs); AI-distilled "observer's record" sections rendered distinctly (see `/home/mrima/class/ai/notes/week01.md` and `week02.md` for the real format).
- **Live community board**: Supabase Realtime leaderboard, "who studied today", group hours.
- **Profile**: badge gallery, stats, contribution-style study heatmap.
- **Admin**: approval queue, member table with revoke-reason dropdown, invite-code usage, inline curriculum editor, mini analytics (DAU, watch hours, step velocity).

## Ground rules

- **Stack**: Next.js 15 App Router (TypeScript) on Vercel; Supabase for Postgres + Auth + RLS + Realtime + Storage; Resend for email; pg_cron for scheduled jobs. Cloudflare stays only for DNS/redirect from the old URL.
- **Component library — HeroUI (decided).** Build the UI on HeroUI components; the HeroUI MCP server and CLI are installed on this machine — use the MCP for component docs/APIs and the CLI to scaffold/add components. HeroUI already ships the full primitive layer — toasts, modals, drawers, dropdowns, tables, tabs, inputs, progress bars, skeletons, avatars, badges, tooltips — so **never build your own version of anything HeroUI provides**; when a screen needs one of these, reach for the HeroUI component first. The heavy lifting in this project is **customization, not construction**: HeroUI is deeply themeable (its Tailwind-based theme plugin — colors, layout tokens, per-component slot overrides, and variants), so invest the effort in mapping the Nocturne design tokens from the design bundle onto the HeroUI theme so every component matches the mockups pixel-perfectly out of the box. Write truly custom components only where HeroUI has no equivalent (e.g., the segment-based video progress bar, study heatmap).
- **Libraries, not wheels.** Never hand-roll what a battle-tested library provides. Confirmed choices: **Zustand** for client state, **TanStack Query** for server state/caching alongside the Supabase JS client, **TipTap** for the rich-text notes editor, **PDF.js** for the reader. For everything else (charts/graphs for the admin analytics and profile heatmap, forms, LaTeX rendering, date handling, virtualized lists), pick the current best-in-class maintained library rather than writing it yourself.
- **Research before building — mandatory first step of every milestone.** Before writing code, run a research pass: query the HeroUI MCP and Context7 for current APIs of every library you're about to use (Next.js 15, Supabase SSR auth helpers, TanStack Query v5, TipTap v2/v3, YouTube IFrame API); use `gh search repos` / `gh search code` for proven reference implementations (e.g., Next.js + Supabase auth starters, TipTap + GitHub-publish setups, YouTube watch-tracking approaches); check npm for the graph/LaTeX/etc. picks and verify they're maintained. Prefer adapting a proven pattern over inventing one. Summarize the research findings and chosen libraries before scaffolding.
- **Build location**: scaffold in a new directory `/home/mrima/class/ai/studyos/` with its own new GitHub repo (`mosesmrima/study-os`), unless V2-ARCHITECTURE.md specifies otherwise. **Do not modify or break the live v1 tracker** — it keeps serving users until migration cutover.
- **Security**: no hardcoded secrets (env vars only, validated at startup); RLS on every table; parameterized queries; rate limiting on auth endpoints; all input validated with Zod at the boundary.
- **Testing**: TDD where practical; unit + integration tests; Playwright for the critical flows (sign-up → verify → first step; watch → auto-complete; note → GitHub publish). Target 80% coverage on business logic.
- **Free resources only** — every external link a learner sees must be free and legal.
- **Use specialised subagents throughout — don't do everything in the main loop.** Delegate to the installed agents at the right moments, and run independent ones in parallel:
  - **planner** — at the start of each milestone, turn the milestone into a concrete task breakdown.
  - **general-purpose / docs-lookup** — the research pass (library APIs via Context7/HeroUI MCP, `gh search` for reference implementations); fan out parallel research agents for independent topics.
  - **database-reviewer** — review every migration/schema/RLS change before it's applied to Supabase.
  - **tdd-guide** — drive test-first implementation of business logic (plan queue, watch-interval crediting, lifecycle state machine).
  - **typescript-reviewer + security-reviewer** — after each coherent chunk of code, in parallel; fix CRITICAL/HIGH findings before moving on. security-reviewer is mandatory for auth, GitHub App, and admin code.
  - **build-error-resolver** — whenever the build or typecheck breaks.
  - **e2e-runner** — Playwright coverage of the critical flows at the end of each milestone.
- **Milestones**: follow M0–M5 from the architecture doc. Complete M0 (scaffold, Supabase project, schema + RLS, auth, curriculum seed) end-to-end and verified before touching M1. Commit in conventional-commit style at every coherent stopping point.
- The owner/admin is Mrima (`mrimamss@gmail.com`, GitHub `mosesmrima`). Ask before anything destructive or externally visible (new cloud resources, DNS changes, emails to real users).

## Definition of done for the first session

M0 shipped: a deployed Vercel preview where Mrima can sign up, verify email, land on the Today screen styled per the Nocturne design system, and see the real week-1 curriculum steps served from Supabase.
