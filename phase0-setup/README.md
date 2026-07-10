# Phase 0 — Setup (Week 0)

> **▶ Your ordered steps live in the tracker app → https://ai-tracker.mrima.workers.dev (open "Now"). This README is reference.**

**Goal:** a working environment and the habits that make 18 months stick.

## Do this, in order

1. **Bootstrap the environment**
   ```bash
   bash setup.sh
   ```
   This installs base deps with `uv` and registers a Jupyter kernel.

2. **Verify it works**
   ```bash
   uv run python -c "import numpy, matplotlib; print('ok')"
   uv run python track.py status        # should show 0%
   uv run jupyter lab                    # launches, then Ctrl-C to close
   ```

   Week 0 is **setup only** — no course videos yet. (Essence of Linear Algebra is
   Week 1; Karpathy's micrograd is Phase 3 / Week 17. Don't watch them here.)

3. **Write your first note** in `notes/weekly-notes.md` (already has a Week 0 stub).

6. **Mark it done**
   ```bash
   uv run python track.py done week00
   ```

## Checkpoint
- [ ] `setup.sh` ran cleanly and `track.py status` works.
- [ ] You can run a test, edit a file, and re-run the test.
- [ ] You watched the 3B1B linear algebra series.

> If Python feels shaky at all, do **CS50P** before starting Phase 1.

Next: **Phase 1 — Math** → `../phase1-math/`.
