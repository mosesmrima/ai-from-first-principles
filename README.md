# AI From First Principles → Frontier AI

An executable, build-first curriculum that takes you from linear algebra to training
LLMs, post-training them, and shipping agentic systems. ~18–24 months at 10–15 h/week.

> **The one rule:** You do not advance because you finished videos. You advance because you
> **built something**. Every phase ends with an artifact. Every early week ships with a test
> that defines "done." Courses without output are just videos.

This repo is the merge of two roadmaps into a single Phase 0–10 plan you can actually run.

---

## How to track your progress

Use the **web tracker** — it holds your ordered daily steps (exact videos, time estimates, checkpoints) and always shows what to do next: **https://ai-tracker.mrima.workers.dev** (open "Now").

The local `track.py` CLI + `PROGRESS.md` are an offline alternative. **The web app is primary — don't follow both.**

---

## Quickstart

```bash
# 1. Bootstrap the environment (uv + Jupyter). One time.
bash setup.sh

# 2. See where you are and what's next.
uv run python track.py status
uv run python track.py next

# 3. Start Week 1 — make the failing tests pass.
uv run pytest phase1-math/week01-vectors-matrices/   # RED (NotImplementedError)
$EDITOR phase1-math/week01-vectors-matrices/matrix_multiply.py
uv run pytest phase1-math/week01-vectors-matrices/   # GREEN, then mark it done:
uv run python track.py done week01
```

If your Python feels shaky at all, do **CS50P** before Phase 1.

---

## How to advance a week

1. **Watch / read** the resources in that week's `README.md` (≤ 4 h).
2. **Build the artifact** — implement the stub, write the notebook, make the test pass.
3. **Write a note** in `notes/weekly-notes.md` (what you learned / what confused you / what you built).
4. **Mark it done:** `uv run python track.py done <week-id>` → keeps `PROGRESS.md` honest.

A week without a committed artifact is not done — no matter how many videos you watched.

---

## Weekly cadence (10–15 h)

| Block | Hours |
|---|---|
| Lectures / reading | 3–4 h |
| Coding / building | 5–6 h |
| Math / exercises | 2 h |
| Papers | 1–2 h |
| Writing notes publicly | 1 h |

---

## Repo map

| Path | What it is |
|---|---|
| `ROADMAP.md` | The full merged curriculum — every phase & week, resources, artifacts, checkpoints. |
| `PROGRESS.md` | Auto-generated checklist of every milestone. Regenerate with `track.py render`. |
| `track.py` / `progress.json` | Progress CLI + its data file. |
| `phaseN-*/` | One folder per phase. Each has a `README.md`; early weeks have code + tests. |
| `notes/` | Your running learning log + a per-week template. |
| `papers/` | Ordered reading list, how-to-read-a-paper, summary template. |

The 10 phases:

| Phase | Focus | Weeks |
|---|---|---|
| 0 | Setup | Week 0 |
| 1 | Math for ML | 1–8 |
| 2 | Classical ML & Classical AI | 9–16 |
| 3 | Neural Nets from First Principles (+ PyTorch) | 17–28 |
| 4 | Deep Learning Breadth | 29–36 |
| 5 | Transformers & LLMs | 37–48 |
| 6 | LLM Engineering | 49–60 |
| 7 | RLHF, Post-Training, Evals | 61–68 |
| 8 | Agentic Systems | 69–76 |
| 9 | Research Apprenticeship | 77+ (ongoing) |
| 10 | Advanced Systems | Year 2+ |

---

## Habits from day 1 (this is what separates practitioners from researchers)

- **Read code more than tutorials.** Watch a video, close it, rewrite the code yourself.
- **Reimplement core ideas from scratch.** Don't copy. Type it out, break it, fix it.
- **Read one paper every week.** Write a one-page summary (`papers/`).
- **Write technical notes publicly.** A blog post / GitHub writeup per quarter.
- **Contribute to open source** once you can: PyTorch, Hugging Face, vLLM, LangGraph.

---

## Portfolio you'll have by the end

1. Matrix algebra library · 2. Logistic regression from scratch · 3. Neural-network framework ·
4. CNN classifier · 5. Transformer implementation · 6. GPT implementation · 7. Fine-tuned LLM ·
8. Production RAG system · 9. Security AI agent · 10. Paper-reproduction project.

`track.py` tracks all ten as milestones alongside the weeks.

---

## Appendix A — Key YouTube channels (subscribe now)

- **3Blue1Brown** — math & visual intuition
- **Andrej Karpathy** — build everything from scratch
- **StatQuest (Josh Starmer)** — stats & ML, clearly
- **Yannic Kilcher** — paper deep-dives
- **Aleksa Gordić (The AI Epiphany)** — paper implementations
- **sentdex** — practical Python/ML
- **Lex Fridman** — long-form researcher interviews

## Appendix B — Free / cheap GPU

| Resource | Notes |
|---|---|
| Kaggle Notebooks | Free T4, ~30 h/week |
| Google Colab | Free T4, limited sessions |
| Google TPU Research Cloud | Apply for free research access |
| vast.ai / Lambda Labs | Affordable on-demand rental |

---

*The biggest differentiator is not which courses you take. It is whether you implement
everything yourself rather than consuming frameworks. Build, don't just watch.*
