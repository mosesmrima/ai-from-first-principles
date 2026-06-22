"""Spec for the Week 8 capstone. Run: uv run pytest phase1-math/week08-capstone-regression/

Tests use NumPy only and synthetic data — no sklearn. They fail until both models are
implemented. The thresholds are generous; correct gradient descent clears them easily.
"""
import numpy as np
import pytest

from linear_regression import LinearRegression, mse
from logistic_regression import LogisticRegression, sigmoid


# --- linear regression ------------------------------------------------------
def test_mse():
    assert mse(np.array([1.0, 2.0, 3.0]), np.array([1.0, 2.0, 3.0])) == 0.0
    assert mse(np.array([0.0, 0.0]), np.array([1.0, 1.0])) == 1.0


def test_linear_regression_recovers_line():
    rng = np.random.default_rng(0)
    X = rng.normal(size=(200, 2))
    true_w = np.array([3.0, -2.0])
    true_b = 1.5
    y = X @ true_w + true_b + rng.normal(scale=0.05, size=200)

    model = LinearRegression(lr=0.1, epochs=2000).fit(X, y)

    assert np.allclose(model.weights, true_w, atol=0.2)
    assert abs(model.bias - true_b) < 0.2


def test_linear_regression_loss_decreases():
    rng = np.random.default_rng(1)
    X = rng.normal(size=(100, 1))
    y = (2.0 * X[:, 0] + 0.5) + rng.normal(scale=0.1, size=100)
    model = LinearRegression(lr=0.1, epochs=500).fit(X, y)
    assert len(model.loss_history) == 500
    assert model.loss_history[-1] < model.loss_history[0]


# --- logistic regression ----------------------------------------------------
def test_sigmoid():
    assert sigmoid(np.array([0.0]))[0] == pytest.approx(0.5)
    assert sigmoid(np.array([100.0]))[0] == pytest.approx(1.0, abs=1e-6)
    assert sigmoid(np.array([-100.0]))[0] == pytest.approx(0.0, abs=1e-6)


def test_logistic_regression_separable():
    rng = np.random.default_rng(2)
    # Two well-separated clusters.
    n = 200
    class0 = rng.normal(loc=[-2, -2], scale=0.7, size=(n, 2))
    class1 = rng.normal(loc=[2, 2], scale=0.7, size=(n, 2))
    X = np.vstack([class0, class1])
    y = np.concatenate([np.zeros(n), np.ones(n)])

    model = LogisticRegression(lr=0.1, epochs=2000).fit(X, y)
    acc = (model.predict(X) == y).mean()
    assert acc > 0.9


def test_logistic_regression_loss_decreases():
    rng = np.random.default_rng(3)
    X = rng.normal(size=(150, 2))
    y = (X[:, 0] + X[:, 1] > 0).astype(float)
    model = LogisticRegression(lr=0.1, epochs=500).fit(X, y)
    assert model.loss_history[-1] < model.loss_history[0]
