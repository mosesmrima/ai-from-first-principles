# Week 5 — Partial Derivatives & the Chain Rule

**Topics:** partial derivatives, the multivariate chain rule — the mathematical heart of backprop.

**Watch:** 3Blue1Brown — *Essence of Calculus* (chain rule); the *Neural Networks* series ch. 3–4
(backpropagation calculus).

## 🛠 Build
A **manual backprop notebook**: take a tiny computation graph, e.g.
`L = (w*x + b - y)**2`, and compute every partial derivative (`dL/dw`, `dL/db`) **by hand on
paper first**, then verify numerically in NumPy with finite differences:
`(f(w+h) - f(w-h)) / (2h)`.

This is the single most important week of Phase 1 — it's exactly what micrograd automates in
Phase 3. If the chain rule is solid here, Karpathy's autograd will feel obvious.

## ✅ Checkpoint
Hand-derive backprop for a 2-layer network (one hidden layer) and confirm each gradient matches
a finite-difference check to ~1e-6.

```bash
uv run python track.py done week05
```
