# micrograd — your scalar autograd engine (Week 17)

This is the starting line for Phase 3, the most important phase. You're rebuilding Karpathy's
`micrograd`: a tiny automatic-differentiation engine over scalar `Value` nodes. Once this works,
backprop will never be mysterious again.

**Watch:** Karpathy — *The spelled-out intro to neural networks and backpropagation: building
micrograd* (Zero to Hero, lesson 1). Then close the video and make these tests pass.

## 🛠 Build
Implement `Value` in `value.py`:
- forward ops: `__add__`, `__mul__`, `__pow__`, `tanh`
- reverse-mode `backward()` (topological sort, then apply the chain rule node by node)

```bash
uv run pytest phase3-neural-nets/micrograd/   # RED
# implement Value until green
uv run pytest phase3-neural-nets/micrograd/   # GREEN
uv run python track.py done week17
```

`__neg__`, `__sub__`, `__radd__`, `__rmul__`, `__truediv__` are already written in terms of
`__add__`/`__mul__` — so they start working automatically once you implement the two core ops.

## ✅ Checkpoint
Explain how `backward()` uses the chain rule, why nodes must be processed in reverse topological
order, and why gradients **accumulate** (`+=`) when a value is used more than once.

## Where this goes
Weeks 18–20 extend this into neurons, layers, and an MLP. Weeks 27–28 turn it into your own
**Tiny NN framework** (portfolio project #3). Keep building on this file.
