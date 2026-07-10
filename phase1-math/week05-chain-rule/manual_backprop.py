"""Week 5 — backprop by hand, verified with finite differences.

Run: uv run python phase1-math/week05-chain-rule/manual_backprop.py

Goal: hand-derive the gradients of a tiny loss with the chain rule, then confirm
them numerically. This is exactly what micrograd will automate in Phase 3.

Setup: one linear neuron, squared-error loss.
    yhat = w * x + b
    L    = (yhat - y) ** 2
"""
from __future__ import annotations


def forward(w: float, b: float, x: float, y: float) -> float:
    """Return the loss L = (w*x + b - y)**2."""
    return (w * x + b - y) ** 2


def grad_analytic(w: float, b: float, x: float, y: float) -> tuple[float, float]:
    """Return (dL/dw, dL/db), derived BY HAND with the chain rule.

    TODO: let e = (w*x + b - y). Then L = e**2, so dL/de = 2e.
      dL/dw = dL/de * de/dw = 2e * x
      dL/db = dL/de * de/db = 2e * 1
    Return (dL/dw, dL/db).
    """
    raise NotImplementedError("Week 5: implement grad_analytic()")


def grad_numeric(w: float, b: float, x: float, y: float, h: float = 1e-5) -> tuple[float, float]:
    """Central finite-difference estimate of (dL/dw, dL/db) — the ground-truth check."""
    dw = (forward(w + h, b, x, y) - forward(w - h, b, x, y)) / (2 * h)
    db = (forward(w, b + h, x, y) - forward(w, b - h, x, y)) / (2 * h)
    return dw, db


def main():
    w, b, x, y = 0.7, -0.2, 1.5, 1.0
    a = grad_analytic(w, b, x, y)
    n = grad_numeric(w, b, x, y)
    print(f"analytic dL/dw, dL/db = {a}")
    print(f"numeric  dL/dw, dL/db = {n}")
    ok = all(abs(ai - ni) < 1e-4 for ai, ni in zip(a, n))
    print("MATCH ✓" if ok else "MISMATCH ✗ — re-check your chain rule")


if __name__ == "__main__":
    main()
