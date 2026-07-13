"""Week 2 — 2D vector & linear-transformation visualizer.

Run: uv run python phase1-math/week02-transformations/vector_viz.py

This is a *starter*. The `plot_vectors` helper works; your job is to fill in the TODOs so you
can SEE a matrix transform space and watch the basis vectors move.
"""
from __future__ import annotations

import matplotlib.pyplot as plt
import numpy as np


def plot_vectors(vectors: np.ndarray, ax, colors=None, labels=None):
    """Draw each row of `vectors` (shape: N x 2) as an arrow from the origin."""
    colors = colors or ["C0"] * len(vectors)
    for i, v in enumerate(vectors):
        ax.quiver(0, 0, v[0], v[1], angles="xy", scale_units="xy", scale=1,
                  color=colors[i], width=0.012)
        if labels:
            ax.annotate(labels[i], (v[0], v[1]))
    lim = float(np.abs(vectors).max()) * 1.4 + 1
    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)
    ax.axhline(0, color="gray", lw=0.5)
    ax.axvline(0, color="gray", lw=0.5)
    ax.set_aspect("equal")
    ax.grid(True, alpha=0.3)


def apply_transform(matrix: np.ndarray, vectors: np.ndarray) -> np.ndarray:
    """Apply a 2x2 transform to a set of 2D vectors (rows). Returns transformed vectors.

    TODO: implement with matrix multiplication. Remember: to transform row vectors,
    compute `vectors @ matrix.T` (or transpose your mental model — try both and see).
    """
    return vectors @ matrix.T

def main():
    basis = np.array([[1.0, 0.0], [0.0, 1.0]])  # î and ĵ

    # TODO: try a rotation, a shear, and a scaling. Predict before you run.
    rotation_45 = np.array([[np.cos(np.pi / 4), -np.sin(np.pi / 4)],
                            [np.sin(np.pi / 4),  np.cos(np.pi / 4)]])
    shear = np.array([[1.0, 1.0], [0.0, 1.0]])  # noqa: F841  (use me!)

    transformed = apply_transform(rotation_45, basis)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
    plot_vectors(basis, ax1, colors=["C0", "C1"], labels=["î", "ĵ"])
    ax1.set_title("Original basis")
    plot_vectors(shear, ax2, colors=["C0", "C1"], labels=["î'", "ĵ'"])
    ax2.set_title("After 45° rotation")
    fig.tight_layout()
    plt.savefig("vector_viz.png", dpi=120)
    print("Saved vector_viz.png — open it. Now try the shear and a scaling matrix.")


if __name__ == "__main__":
    main()
