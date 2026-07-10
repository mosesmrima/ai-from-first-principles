"""Week 4 — gradient descent, by hand.

Run: uv run python phase1-math/week04-gradients/gradient_descent.py

Goal: FEEL the update rule x ← x - lr * grad(x). Fill in the TODOs, then sweep the
learning rate and watch it converge, crawl, or diverge.
"""
from __future__ import annotations

import matplotlib.pyplot as plt
import numpy as np


def f(x: float) -> float:
    """The function we're minimizing: f(x) = x**2 (a simple bowl)."""
    return x * x


def grad(x: float) -> float:
    """Derivative of f at x.

    TODO: for f(x)=x**2, f'(x)=2x. Return it.
    """
    raise NotImplementedError("Week 4: implement grad()")


def descend(x0: float, lr: float, steps: int) -> list[float]:
    """Run gradient descent from x0 and return the list of x values visited.

    TODO: start at x0; for each step do x = x - lr * grad(x); collect every x.
    """
    raise NotImplementedError("Week 4: implement descend()")


def main():
    xs = np.linspace(-3, 3, 200)
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(xs, [f(x) for x in xs], color="gray", lw=1)
    for lr in (0.05, 0.3, 0.9):
        traj = descend(2.8, lr, 20)
        ax.plot(traj, [f(x) for x in traj], "o-", ms=4, label=f"lr={lr}")
    ax.legend(); ax.set_title("Gradient descent on f(x)=x²")
    plt.savefig("gradient_descent.png", dpi=120)
    print("Saved gradient_descent.png — compare how each learning rate behaves.")


if __name__ == "__main__":
    main()
