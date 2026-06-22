# Phase 1 — Math for Machine Learning (Weeks 1–8)

**Goal:** enough linear algebra, calculus, and probability to read papers and implement backprop.
You do not need PhD math. You need to be unafraid of the notation.

**Dependencies:** base only (`numpy`, `matplotlib`). No PyTorch yet, no sklearn.

## Resources
- 3Blue1Brown — *Essence of Linear Algebra* and *Essence of Calculus* (watch these first)
- MIT 18.06 — Gilbert Strang (linear algebra)
- StatQuest — statistics & probability playlist; Harvard Stat 110 (Blitzstein)
- *Mathematics for Machine Learning* — Deisenroth et al. (free: mml-book.github.io)
- Khan Academy — calculus & probability

## Weekly plan

| Week | Folder | Topics | 🛠 Build | ✅ Checkpoint |
|---|---|---|---|---|
| 1 | `week01-vectors-matrices` | vectors, matrices, dot products | `matrix_multiply.py` (+ tests) | explain matmul without notes |
| 2 | `week02-transformations` | linear transformations, basis | 2D vector visualizer | show how a matrix warps the basis |
| 3 | `week03-eigen` | eigenvalues/vectors, SVD intuition | PCA intuition notebook | explain what an eigenvector is |
| 4 | `week04-gradients` | derivatives, gradients | gradient-descent viz | derive the GD update rule |
| 5 | `week05-chain-rule` | partial derivatives, chain rule | manual backprop notebook | hand-derive backprop for a 2-layer net |
| 6 | `week06-probability` | probability, Bayes | coin-flip sims (+ tests) | state & apply Bayes' theorem |
| 7 | `week07-distributions` | distributions, expectation, variance, entropy | distribution visualizer | compute E[X], Var[X]; explain entropy |
| 8 | `week08-capstone-regression` | — | **Linear + Logistic Regression, NumPy only** (+ tests) | train both; explain loss & gradients |

## How a week goes (TDD where there's code)
```bash
uv run pytest phase1-math/week01-vectors-matrices/   # RED — NotImplementedError
# implement the stub until green
uv run pytest phase1-math/week01-vectors-matrices/   # GREEN
uv run python track.py done week01
```
For visual weeks (2–5, 7) the "test" is the figure/notebook + a note explaining it.

## Capstone (Week 8)
Linear and logistic regression with **NumPy only** — no sklearn. This is portfolio project #2.
The failing tests in `week08-capstone-regression/test_models.py` are your spec.
