# Phase 3 — Neural Networks From First Principles + PyTorch (Weeks 17–28)

**The most important phase.** Build backprop, MLPs, and a tiny framework yourself. Do **not**
start with LangChain or ChatGPT wrappers. Build everything.

**The spine:** Andrej Karpathy — *Neural Networks: Zero to Hero*
(karpathy.ai/zero-to-hero.html · github.com/karpathy/nn-zero-to-hero).
**Watch a lesson, close the video, rewrite the code yourself.** Don't copy.

**Supplements:** 3Blue1Brown NN series · fast.ai Part 1 & 2 · d2l.ai · MIT 6.S191.
**PyTorch** (woven in from ~Week 22): pytorch.org/tutorials · Daniel Bourke's course.

**Dependencies:** `uv sync --extra dl` (PyTorch) when you reach Week 22.

## Weekly plan

| Week | Focus | 🛠 Build |
|---|---|---|
| 17 | micrograd part 1 | `Value` class — start in `micrograd/` (scaffolded) |
| 18 | autograd | full backward pass over the graph |
| 19 | backpropagation | topological sort + `.backward()` |
| 20 | MLP | multi-layer perceptron on `Value` |
| 21 | training | character classifier; loss tracking |
| 22 | optimization | SGD, Momentum, Adam (+ start PyTorch tensors/autograd) |
| 23 | activations | ReLU, Tanh, Sigmoid |
| 24 | regularization | dropout, batchnorm |
| 25–26 | language modeling | **makemore** (bigram → MLP → deeper) |
| 27–28 | **Capstone** | **Tiny NN framework**: autograd + optimizer + MLP + training loop |

## Head start: `micrograd/`
`micrograd/value.py` + `micrograd/test_value.py` are already scaffolded with failing tests.
This is your Week 17 starting line:
```bash
uv run pytest phase3-neural-nets/micrograd/   # RED
# implement Value.__add__, __mul__, backward(), ...
uv run pytest phase3-neural-nets/micrograd/   # GREEN
```

## Capstone (Weeks 27–28)
A **Tiny Neural Network framework** — autograd engine, optimizer, MLP, training loop — that you
wrote end to end. Portfolio project #3.
