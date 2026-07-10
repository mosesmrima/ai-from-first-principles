"""Week 7 — distributions, expectation, variance, entropy.

Run: uv run python phase1-math/week07-distributions/distributions.py

Goal: sample from common distributions, overlay the theory, and confirm that your
empirical mean/variance match the formulas. Fill in the TODOs.
"""
from __future__ import annotations

import matplotlib.pyplot as plt
import numpy as np


def empirical_stats(samples: np.ndarray) -> tuple[float, float]:
    """Return (mean, variance) of the samples.

    TODO: return (samples.mean(), samples.var()).
    """
    raise NotImplementedError("Week 7: implement empirical_stats()")


def bernoulli_entropy(p: float) -> float:
    """Entropy of a Bernoulli(p) in bits: -p*log2(p) - (1-p)*log2(1-p).

    TODO: implement it. Handle p=0 and p=1 (entropy is 0 there — avoid log2(0)).
    """
    raise NotImplementedError("Week 7: implement bernoulli_entropy()")


def main():
    rng = np.random.default_rng(0)
    gauss = rng.normal(loc=2.0, scale=1.5, size=10000)
    mean, var = empirical_stats(gauss)
    print(f"Gaussian(2, 1.5²): empirical mean={mean:.3f} (theory 2.0), var={var:.3f} (theory 2.25)")

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))
    ax1.hist(gauss, bins=50, density=True, alpha=0.5)
    xs = np.linspace(gauss.min(), gauss.max(), 200)
    ax1.plot(xs, np.exp(-((xs - 2) ** 2) / (2 * 1.5 ** 2)) / (1.5 * np.sqrt(2 * np.pi)), "C3")
    ax1.set_title("Gaussian: samples vs theory")

    ps = np.linspace(0.001, 0.999, 200)
    ax2.plot(ps, [bernoulli_entropy(p) for p in ps])
    ax2.set_title("Bernoulli entropy — peaks at p=0.5"); ax2.set_xlabel("p")
    plt.tight_layout(); plt.savefig("distributions.png", dpi=120)
    print("Saved distributions.png")


if __name__ == "__main__":
    main()
