# Week 7 — Distributions, Expectation, Variance, Entropy

**Topics:** common distributions (uniform, Bernoulli, binomial, Gaussian), expectation E[X],
variance Var[X], and entropy.

**Watch:** StatQuest (distributions, expected value, variance); Stat 110 lectures on distributions.
**Read:** MML book §6 (probability & distributions).

## 🛠 Build
A **distribution visualizer** (`distributions.py` or a notebook):
- Sample from uniform, Bernoulli, binomial, and Gaussian (`numpy.random`).
- Plot histograms; overlay the theoretical PDF/PMF.
- Compute empirical mean & variance and compare to the theoretical values.
- Bonus: compute the entropy of a Bernoulli(p) as p sweeps 0→1 and plot it — note the peak at p=0.5.

## ✅ Checkpoint
Compute E[X] and Var[X] for a Bernoulli and a small discrete distribution by hand, and explain
in one sentence what entropy measures (expected surprise / uncertainty).

```bash
uv run python track.py done week07
```
