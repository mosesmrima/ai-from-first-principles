"""Week 8 capstone — linear regression from scratch (NumPy only, no sklearn).

Implement so test_models.py passes. Gradient descent on mean squared error.
"""
from __future__ import annotations

import numpy as np


def mse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean squared error: mean((y_true - y_pred)**2)."""
    raise NotImplementedError("Week 8: implement mse()")


class LinearRegression:
    """Linear regression trained with batch gradient descent.

    Attributes (set during fit):
        weights : np.ndarray, shape (n_features,)
        bias    : float
        loss_history : list[float]   # MSE after each epoch — should decrease
    """

    def __init__(self, lr: float = 0.01, epochs: int = 1000):
        self.lr = lr
        self.epochs = epochs
        self.weights: np.ndarray | None = None
        self.bias: float = 0.0
        self.loss_history: list[float] = []

    def fit(self, X: np.ndarray, y: np.ndarray) -> "LinearRegression":
        """Fit via gradient descent.

        X: (n_samples, n_features), y: (n_samples,).
        Initialise weights to zeros, then for each epoch:
          - predict y_hat = X @ weights + bias
          - gradients:  dw = (2/n) * X.T @ (y_hat - y);  db = (2/n) * sum(y_hat - y)
          - update weights -= lr*dw,  bias -= lr*db
          - append mse(y, y_hat) to loss_history
        Return self.
        """
        raise NotImplementedError("Week 8: implement LinearRegression.fit()")

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Return X @ weights + bias."""
        raise NotImplementedError("Week 8: implement LinearRegression.predict()")
