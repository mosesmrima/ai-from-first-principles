"""micrograd — a tiny scalar autograd engine (Week 17).

A `Value` wraps a single number and remembers how it was computed, so it can compute gradients
via reverse-mode automatic differentiation. Implement the methods marked NotImplementedError
so test_value.py passes.

The derived operators (__neg__, __sub__, __radd__, __rmul__, __truediv__) are already written in
terms of __add__ and __mul__ — once you implement those two (and __pow__), the rest just work.
"""
from __future__ import annotations


class Value:
    def __init__(self, data: float, _children: tuple = (), _op: str = ""):
        self.data = float(data)
        self.grad = 0.0
        # internal autograd bookkeeping
        self._backward = lambda: None      # how to push grad to our inputs
        self._prev = set(_children)         # the Values that produced this one
        self._op = _op                      # for debugging / visualization

    # --- core forward ops (implement these) --------------------------------
    def __add__(self, other: "Value | float") -> "Value":
        """Return a new Value = self + other.

        Wrap raw numbers: `other = other if isinstance(other, Value) else Value(other)`.
        Set out._backward so that, given out.grad, it adds the local gradient to each input:
        for addition, d(out)/d(self) = 1 and d(out)/d(other) = 1, so
            self.grad  += out.grad
            other.grad += out.grad
        (Use += so gradients accumulate when a node is reused.)
        """
        raise NotImplementedError("Week 17: implement Value.__add__")

    def __mul__(self, other: "Value | float") -> "Value":
        """Return a new Value = self * other.

        Local gradients: d(out)/d(self) = other.data, d(out)/d(other) = self.data.
            self.grad  += other.data * out.grad
            other.grad += self.data  * out.grad
        """
        raise NotImplementedError("Week 17: implement Value.__mul__")

    def __pow__(self, exponent: float) -> "Value":
        """Return self ** exponent, for a constant int/float exponent.

        d(out)/d(self) = exponent * self.data ** (exponent - 1).
        """
        raise NotImplementedError("Week 17: implement Value.__pow__")

    def tanh(self) -> "Value":
        """Return tanh(self).

        If t = tanh(self.data), then d(out)/d(self) = (1 - t**2).
        """
        raise NotImplementedError("Week 17: implement Value.tanh")

    # --- reverse-mode autodiff (implement this) ----------------------------
    def backward(self) -> None:
        """Compute gradients of this Value w.r.t. every Value it depends on.

        Steps:
          1. Build a topological ordering of the graph (all dependencies before dependents).
          2. Seed self.grad = 1.0 (d(self)/d(self) = 1).
          3. Walk the order in reverse, calling node._backward() on each.
        """
        raise NotImplementedError("Week 17: implement Value.backward")

    # --- derived ops (already done — rely on the ones above) ---------------
    def __neg__(self):
        return self * -1

    def __radd__(self, other):
        return self + other

    def __sub__(self, other):
        return self + (-other)

    def __rsub__(self, other):
        return other + (-self)

    def __rmul__(self, other):
        return self * other

    def __truediv__(self, other):
        return self * (other ** -1 if isinstance(other, Value) else other ** -1)

    def __repr__(self):
        return f"Value(data={self.data}, grad={self.grad})"
