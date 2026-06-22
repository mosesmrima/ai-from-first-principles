"""Spec for Week 1. These define 'done'. Run: uv run pytest phase1-math/week01-vectors-matrices/

They fail (RED) until you implement matrix_multiply.py. Don't change the tests to pass —
change the implementation. (If you find a genuine bug in a test, that's the exception.)
"""
import pytest

from matrix_multiply import dot, matmul, shape, transpose


def test_shape():
    assert shape([[1, 2, 3], [4, 5, 6]]) == (2, 3)
    assert shape([[7]]) == (1, 1)


def test_shape_ragged_raises():
    with pytest.raises(ValueError):
        shape([[1, 2], [3]])


def test_dot():
    assert dot([1, 2, 3], [4, 5, 6]) == 32
    assert dot([0, 0], [1, 1]) == 0


def test_dot_length_mismatch_raises():
    with pytest.raises(ValueError):
        dot([1, 2, 3], [1, 2])


def test_transpose():
    assert transpose([[1, 2, 3], [4, 5, 6]]) == [[1, 4], [2, 5], [3, 6]]
    assert transpose([[1]]) == [[1]]


def test_matmul_basic():
    assert matmul([[1, 2], [3, 4]], [[5, 6], [7, 8]]) == [[19, 22], [43, 50]]


def test_matmul_identity():
    identity = [[1, 0], [0, 1]]
    m = [[2, 3], [4, 5]]
    assert matmul(m, identity) == m
    assert matmul(identity, m) == m


def test_matmul_non_square():
    # (2x3) @ (3x2) -> (2x2)
    a = [[1, 2, 3], [4, 5, 6]]
    b = [[7, 8], [9, 10], [11, 12]]
    assert matmul(a, b) == [[58, 64], [139, 154]]


def test_matmul_dimension_mismatch_raises():
    with pytest.raises(ValueError):
        matmul([[1, 2]], [[1, 2]])  # cols(A)=2 != rows(B)=1
