# Week 8 — Capstone: Linear & Logistic Regression (NumPy only)

**This is the Phase 1 capstone and portfolio project #2.** No sklearn — implement the models,
the loss functions, and the gradient-descent training yourself. Everything you learned in
weeks 1–7 (vectors, gradients, the chain rule, probability) comes together here.

## 🛠 Build
- `linear_regression.py` — `LinearRegression` (gradient descent on MSE) + `mse()`.
- `logistic_regression.py` — `LogisticRegression` (gradient descent on log-loss) + `sigmoid()`.

```bash
uv run pytest phase1-math/week08-capstone-regression/   # RED
# implement both models until green
uv run pytest phase1-math/week08-capstone-regression/   # GREEN
uv run python track.py done week08
uv run python track.py done portfolio02      # mark the portfolio milestone too
```

The tests in `test_models.py` are the spec: training must reduce the loss, recover the true
weights on synthetic data, and classify a separable dataset with >90% accuracy.

## ✅ Checkpoint
Explain, without notes:
- The linear-regression loss (MSE) and its gradient w.r.t. the weights.
- Why logistic regression uses the sigmoid + log-loss instead of MSE.
- What one step of gradient descent does to the weights.

## Stretch
Add L2 regularization; plot the loss curve; compare your fitted weights to the closed-form
normal-equation solution for linear regression.
