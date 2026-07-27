# week02 — Linear transformations & basis

- **Learned:** a matrix IS where the basis lands; vectors @ matrix.T batches the transform
- **Confused by:** np.ndarray vs np.array constructor trap
- **Built:** vector_viz.py apply_transform (loop first, then vectorized)
- **Next:** rotation/shear/scaling plots + checkpoint

## Observer's record (distilled by Claude from our sessions)

### What you actually learned (evidenced)
- **A matrix IS a transformation.** You ran the 45° rotation and saw î land at (0.71, 0.71) —
  literally the first column of your rotation matrix. The picture and the storage question from
  week 1 fused into one idea.
- **Vectorization, self-taught.** You first wrote the loop `[v @ matrix.T for v in vectors]`,
  then came back a day later and refactored to `vectors @ matrix.T` on your own — committed
  separately. That refactor IS retention: applying week-1 knowledge to improve week-2 code
  without being told. This is the exact skill NumPy work runs on from Phase 3 onward.
- **Git muscle:** first solo add/commit/push cycle on your own work (and survived the
  master→main rename).

### Where you struggled (and why it was fine)
- `np.ndarray(result)` instead of `np.array(result)` — the constructor-vs-factory trap.
  Everyone hits it exactly once. You now know: `np.array` builds FROM data; `np.ndarray`
  allocates BY shape.
- A ~week gap between sessions triggered "I'm not retaining anything" dread. The evidence said
  otherwise (see the refactor above). Lesson encoded into the schedule: recap weeks now exist
  at the end of every phase, and re-reviewing old material after a gap is spaced repetition,
  not falling behind.

### Quirks worth keeping
- The transform of row-vectors is `V @ M.T` because storage is rows but meaning is columns —
  the same rows/columns duality, third appearance. It will keep coming back; that's the spiral.
