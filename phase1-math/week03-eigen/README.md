# Week 3 — Eigenvalues, Eigenvectors, SVD intuition

**Topics:** eigenvalues/eigenvectors, what they mean geometrically, intuition for SVD.

**Watch:** 3Blue1Brown — *Essence of Linear Algebra*, chapter on eigenvectors/eigenvalues.
**Read:** MML book §4 (eigendecomposition, SVD).

## 🛠 Build
A **PCA intuition notebook** (`pca_intuition.ipynb` — create it with `uv run jupyter lab`):
- Generate 2D correlated data.
- Compute the covariance matrix and its eigenvectors/eigenvalues (`numpy.linalg.eig`).
- Plot the eigenvectors over the data — see that the top eigenvector points along maximum variance.
- Project the data onto the top component.

## ✅ Checkpoint
Explain what an eigenvector *is* (a direction the transformation only stretches, doesn't rotate)
and why PCA's principal components are the covariance matrix's eigenvectors.

```bash
uv run python track.py done week03
```
