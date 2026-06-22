"""Week 6 — coin-flip simulations and the law of large numbers.

Implement each function so test_coin_flips.py passes. Use Python's `random` module
(seed it for reproducible tests — the tests pass a seed).
"""
from __future__ import annotations

import random


def empirical_probability(outcomes: list[int]) -> float:
    """Fraction of outcomes equal to 1 (heads), i.e. mean of a list of 0/1.

    empirical_probability([1, 0, 1, 1]) -> 0.75
    Raise ValueError on an empty list.
    """
    raise NotImplementedError("Week 6: implement empirical_probability()")


def simulate_flips(n: int, p_heads: float = 0.5, seed: int | None = None) -> list[int]:
    """Return a list of n flips (1 = heads, 0 = tails) with P(heads) = p_heads.

    If seed is given, results must be reproducible. Raise ValueError if n < 0
    or p_heads is outside [0, 1].
    """
    raise NotImplementedError("Week 6: implement simulate_flips()")


def running_estimates(flips: list[int]) -> list[float]:
    """Return the running empirical probability after each flip.

    running_estimates([1, 0, 1]) -> [1.0, 0.5, 0.6666...]
    Use this to plot convergence toward the true probability (law of large numbers).
    """
    raise NotImplementedError("Week 6: implement running_estimates()")


if __name__ == "__main__":
    flips = simulate_flips(5000, p_heads=0.5, seed=42)
    print("Empirical P(heads) over 5000 flips:", empirical_probability(flips))
    # Plot running_estimates(flips) with matplotlib to watch it settle near 0.5.
