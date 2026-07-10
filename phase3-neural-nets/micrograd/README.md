# micrograd — your scalar autograd engine (Week 17)

**Artifact:** `value.py` — implement the `Value` node: forward ops (`__add__`, `__mul__`, `__pow__`, `tanh`) and reverse-mode `backward()` (topological sort, then chain rule node by node).

**Do the steps in the app** → open **Now** at https://ai-tracker.mrima.workers.dev
(exact videos, time estimates, and the order live there — this README is just a local reference).

**Verify:** `uv run pytest phase3-neural-nets/micrograd/`

**Checkpoint:** Explain how `backward()` uses the chain rule, why nodes must be processed in reverse topological order, and why gradients **accumulate** (`+=`) when a value is used more than once.
