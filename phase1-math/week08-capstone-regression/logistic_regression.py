"""Week 8 capstone — logistic regression from scratch (NumPy only, no sklearn).

Implement so test_models.py passes. Gradient descent on the log-loss (binary cross-entropy).
"""
from __future__ import annotations

import numpy as np


def sigmoid(z: np.ndarray) -> np.ndarray:
    """Element-wise logistic sigmoid: 1 / (1 + exp(-z)).

    Tip: clip z to a safe range (e.g. [-500, 500]) before exp to avoid overflow warnings.
    sigmoid(0) == 0.5.
    """
    raise NotImplementedError("Week 8: implement sigmoid()")


class LogisticRegression:
    """Binary logistic regression trained with batch gradient descent.

    Attributes (set during fit):
        weights : np.ndarray, shape (n_features,)
        bias    : float
        loss_history : list[float]   # log-loss after each epoch — should decrease
    """

    def __init__(self, lr: float = 0.1, epochs: int = 2000):
        self.lr = lr
        self.epochs = epochs
        self.weights: np.ndarray | None = None
        self.bias: float = 0.0
        self.loss_history: list[float] = []

    def fit(self, X: np.ndarray, y: np.ndarray) -> "LogisticRegression":
        """Fit via gradient descent.

        X: (n_samples, n_features), y: (n_samples,) of 0/1.
        For each epoch:
          - p = sigmoid(X @ weights + bias)
          - gradients:  dw = (1/n) * X.T @ (p - y);  db = (1/n) * sum(p - y)
          - update weights, bias
          - append log-loss -mean(y*log(p) + (1-y)*log(1-p)) to loss_history
            (add a tiny epsilon inside the logs for numerical safety)
        Return self.
        """
        raise NotImplementedError("Week 8: implement LogisticRegression.fit()")

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Return P(y=1 | x) = sigmoid(X @ weights + bias)."""
        raise NotImplementedError("Week 8: implement LogisticRegression.predict_proba()")

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        """Return 0/1 predictions by thresholding predict_proba."""
        raise NotImplementedError("Week 8: implement LogisticRegression.predict()")
