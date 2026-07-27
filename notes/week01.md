# week01 — Vectors, matrices, dot products

## Observer's record (distilled by Claude from our sessions)

### What you actually learned (evidenced, not claimed)
- **matmul from first principles.** You implemented `shape`, `dot`, `transpose`, `matmul` in pure
  Python — all 9 tests green, and it held up under edge probes you never saw (non-square shapes,
  empty matrices, float inputs). `result[i][j] = dot(row i of A, column j of B)` came out of your
  fingers, not a textbook.
- **Why the inner dimensions must match:** you can now say it — a dot product needs equal lengths,
  and matmul dots rows of A (length = cols A) against columns of B (length = rows B).
- **Rows vs columns — the deep one.** You asked the question most learners never notice: "3B1B says
  columns are where î/ĵ land, but the inner lists are rows — which is it?" Answer you now own:
  *rows are how a matrix is stored and computed; columns are what it means geometrically.* Your own
  code proved it — `b_t[j]` exists precisely because B is stored as rows but matmul needs its columns.
- **Guard-first (checks before work).** You spotted that this is the C in CEI from smart-contract
  auditing. Same principle, new domain: validate before doing anything with consequences.

### Where you struggled (and why it was fine)
- After watching all of Essence of LA you felt nothing had stuck — "watching but not intuitive."
  Then you built matmul and most of it snapped into place. **Pattern to remember: for you, intuition
  arrives through the keyboard, not the video.** Expect the post-watch fog every week; it's the
  before-state, not the verdict.
- Ordering habit: in `matmul` you transposed B *before* validating dimensions (work before checks).
  Harmless here, a real bug class later (a `fit()` half-mutating a model). You fixed it on sight once named.

### Quirks worth keeping
- `zip()` silently truncates to the shorter list — your length guard in `dot` is what makes
  `dot([1,2,3],[1,2])` fail loudly instead of returning a wrong 5.
- You wrote the accumulator loop by hand instead of `sum(...)`. Correct choice for week 1 —
  the loop IS the lesson.
