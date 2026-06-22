# Week 1 — Vectors, Matrices, Dot Products

**Topics:** vectors, matrices, the dot product, matrix multiplication.

**Watch:** 3Blue1Brown — *Essence of Linear Algebra*, chapters 1–4.

## 🛠 Build
Implement matrix multiplication **by hand** (pure Python, no NumPy) in `matrix_multiply.py`.
The tests in `test_matrix_multiply.py` are your spec.

```bash
uv run pytest phase1-math/week01-vectors-matrices/   # RED first
# fill in dot(), transpose(), matmul()
uv run pytest phase1-math/week01-vectors-matrices/   # GREEN
uv run python track.py done week01
```

Why pure Python first? If you can write `matmul` with three nested loops and explain every
index, you understand it. NumPy comes next — and you'll appreciate what it's doing for you.

## ✅ Checkpoint
Explain matrix multiplication out loud, without notes: why the inner dimensions must match,
and what each entry of the result represents (a dot product of a row and a column).

## Stretch
Re-implement `matmul` with NumPy and compare results + speed on a 200×200 example.
This is the seed of **portfolio project #1 (matrix algebra library)** — keep these functions.
