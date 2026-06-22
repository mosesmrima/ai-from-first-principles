# Week 4 — Derivatives & Gradients

**Topics:** derivatives, slopes, the gradient as the direction of steepest ascent.

**Watch:** 3Blue1Brown — *Essence of Calculus*, chapters 1–3. **Read:** MML book §5.

## 🛠 Build
A **gradient-descent visualization** (`gradient_descent.py` or a notebook):
- Pick a simple function, e.g. `f(x) = x**2` or a 2D bowl `f(x,y) = x**2 + y**2`.
- Implement the update `x ← x - lr * grad(x)` by hand.
- Plot the trajectory of points descending toward the minimum.
- Try several learning rates — watch it converge, crawl, or diverge.

## ✅ Checkpoint
Derive the gradient-descent update rule and explain why we step in the *negative* gradient
direction, and what the learning rate controls.

```bash
uv run python track.py done week04
```
