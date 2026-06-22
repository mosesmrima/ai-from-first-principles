# Week 6 — Probability & Bayes

**Topics:** probability basics, conditional probability, Bayes' theorem, the law of large numbers.

**Watch:** StatQuest probability playlist; Harvard Stat 110 (Blitzstein) early lectures.

## 🛠 Build
Coin-flip simulations in `coin_flips.py`. Implement the functions so the tests pass, then use
them to *see* the law of large numbers (empirical probability → true probability as N grows).

```bash
uv run pytest phase1-math/week06-probability/   # RED
# implement empirical_probability(), simulate_flips(), running_estimates()
uv run pytest phase1-math/week06-probability/   # GREEN
uv run python track.py done week06
```

## ✅ Checkpoint
State Bayes' theorem and work one example by hand (e.g. the classic medical-test / false-positive
problem). Explain why a 99%-accurate test for a rare disease still yields mostly false positives.
