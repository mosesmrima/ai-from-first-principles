"""Week 3 — PCA intuition (eigenvectors of the covariance matrix).

Run: uv run python phase1-math/week03-eigen/pca_intuition.py

Goal: SEE that PCA's principal components ARE the eigenvectors of the covariance
matrix, pointing along the directions of maximum variance. Fill in the TODOs.
"""
from __future__ import annotations

import matplotlib.pyplot as plt
import numpy as np


def make_correlated_data(n: int = 300, seed: int = 0) -> np.ndarray:
    """Return n points (shape n×2) that are clearly correlated (a tilted cloud)."""
    rng = np.random.default_rng(seed)
    base = rng.normal(size=(n, 2)) @ np.array([[2.0, 0.0], [0.0, 0.5]])  # stretch
    theta = np.pi / 6
    rot = np.array([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])
    return base @ rot.T


def principal_components(X: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Return (eigenvalues, eigenvectors) of the covariance matrix of centered X.

    TODO:
      1. center X (subtract the mean of each column)
      2. cov = (Xc.T @ Xc) / (n - 1)   # 2x2 covariance matrix
      3. eigenvalues, eigenvectors = np.linalg.eigh(cov)
      4. return them sorted so the LARGEST eigenvalue is first
    """
    raise NotImplementedError("Week 3: implement principal_components()")


def main():
    X = make_correlated_data()
    vals, vecs = principal_components(X)

    fig, ax = plt.subplots(figsize=(6, 6))
    ax.scatter(X[:, 0], X[:, 1], s=8, alpha=0.4)
    mean = X.mean(axis=0)
    for val, vec in zip(vals, vecs.T):
        ax.quiver(*mean, *(vec * np.sqrt(val) * 2), angles="xy", scale_units="xy",
                  scale=1, color="C3", width=0.012)
    ax.set_aspect("equal"); ax.set_title("Covariance eigenvectors = principal components")
    plt.savefig("pca_intuition.png", dpi=120)
    print("Saved pca_intuition.png — the red arrows should lie along the cloud's axes.")


if __name__ == "__main__":
    main()
