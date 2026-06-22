"""Spec for the micrograd Value engine. Run: uv run pytest phase3-neural-nets/micrograd/

Fails until value.py is implemented. The gradient values here are exact and hand-derived —
if your backward() is correct they match precisely.
"""
import pytest

from value import Value


# --- forward ----------------------------------------------------------------
def test_add_forward():
    assert (Value(2.0) + Value(3.0)).data == 5.0
    assert (Value(2.0) + 3.0).data == 5.0   # wraps raw numbers
    assert (3.0 + Value(2.0)).data == 5.0   # __radd__


def test_mul_forward():
    assert (Value(2.0) * Value(3.0)).data == 6.0
    assert (Value(2.0) * 3.0).data == 6.0


def test_pow_forward():
    assert (Value(3.0) ** 2).data == 9.0


def test_sub_and_div_forward():
    assert (Value(5.0) - Value(2.0)).data == 3.0
    assert (Value(6.0) / Value(2.0)).data == pytest.approx(3.0)


# --- backward (the whole point) ---------------------------------------------
def test_backward_simple_mul():
    a = Value(2.0)
    b = Value(-3.0)
    d = a * b
    d.backward()
    assert a.grad == -3.0   # d(d)/d(a) = b
    assert b.grad == 2.0    # d(d)/d(b) = a


def test_backward_karpathy_example():
    a = Value(2.0)
    b = Value(-3.0)
    c = Value(10.0)
    e = a * b
    d = e + c
    f = Value(-2.0)
    L = d * f
    L.backward()
    assert L.grad == 1.0
    assert f.grad == 4.0    # = d.data = a*b + c = 4
    assert d.grad == -2.0   # = f.data
    assert c.grad == -2.0
    assert e.grad == -2.0
    assert a.grad == 6.0    # -2 * b = -2 * -3
    assert b.grad == -4.0   # -2 * a = -2 * 2


def test_grad_accumulates_on_reuse():
    a = Value(3.0)
    b = a + a               # a is used twice
    b.backward()
    assert a.grad == 2.0    # gradients must accumulate, not overwrite


def test_tanh_backward():
    n = Value(0.0)
    o = n.tanh()
    assert o.data == pytest.approx(0.0)
    o.backward()
    assert n.grad == pytest.approx(1.0)   # 1 - tanh(0)**2 = 1
