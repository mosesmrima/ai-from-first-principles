"""Week 1 — matrix multiplication from scratch (pure Python, no NumPy).

Implement each function so the tests in test_matrix_multiply.py pass.
A matrix is a list of equal-length rows: [[1, 2], [3, 4]] is 2x2.
A vector is a flat list: [1, 2, 3].

Delete the `raise NotImplementedError` lines as you go. No NumPy here — the whole point of
Week 1 is to feel the indices in your fingers before a library hides them.
"""
from __future__ import annotations


def shape(m: list[list[float]]) -> tuple[int, int]:
    """Return (rows, cols). Raise ValueError if rows are ragged (unequal lengths)."""
    if not len(m):
        return (0,0)
    for i in range(len(m)):
        if len(m[0]) != len(m[i]):
            raise ValueError("rows are ragged")
    return (len(m), len(m[0]))


def dot(a: list[float], b: list[float]) -> float:
    """Dot product of two equal-length vectors: sum(a_i * b_i).

    Raise ValueError if the lengths differ.
    """
    total = 0
    if len(a) != len(b):
        raise ValueError("vector lengths differ")
    
    for x, y in zip(a, b):
        total += x * y
    return total


def transpose(m: list[list[float]]) -> list[list[float]]:
    """Return the transpose: rows become columns.

    transpose([[1, 2, 3], [4, 5, 6]]) -> [[1, 4], [2, 5], [3, 6]]
    """
    rows, cols = shape(m)
    if not rows:
        return []
    return [[m[i][j] for i in range(rows)] for j in range(cols)]


def matmul(a: list[list[float]], b: list[list[float]]) -> list[list[float]]:
    """Matrix product A @ B.

    If A is (n x m) and B is (m x p), the result is (n x p), where result[i][j] is the dot
    product of row i of A and column j of B. Raise ValueError if the inner dimensions don't
    match (cols(A) != rows(B)).

    Hint: you can build column j of B with transpose(), then reuse dot().
    """
    rows_a, cols_a = shape(a)
    rows_b, cols_b = shape(b)
    b_t = transpose(b)
    result = []
    if cols_a != rows_b:
        raise ValueError("inner dimensions mismatch")
    for i in range(rows_a):
        row = []
        for j in range(cols_b):
            row.append(dot(a[i], b_t[j]))
        result.append(row)
        
    return result

if __name__ == "__main__":
    # Quick manual check once implemented.
    A = [[1, 2], [3, 4]]
    B = [[5, 6], [7, 8]]
    print("A @ B =", matmul(A, B))  # expected [[19, 22], [43, 50]]
