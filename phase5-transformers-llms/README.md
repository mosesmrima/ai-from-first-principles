# Phase 5 — Transformers & LLMs (Weeks 37–48)

**Goal:** where modern AI lives. Build a GPT end to end, from attention to text generation.

**The spine:** Stanford **CS336 — Language Modeling from Scratch** (stanford-cs336.github.io) —
the most rigorous public course on building LLMs from zero.

**Also:** Karpathy "Let's build GPT" & "Reproducing GPT-2" · The Illustrated Transformer
(Jay Alammar) · Lilian Weng's blog · Yannic Kilcher walkthroughs · Hugging Face LLM Course.

**Papers (read alongside — see `../papers/`):** Attention Is All You Need · BERT · GPT-2 ·
GPT-3 · InstructGPT · Chinchilla · LLaMA 1&2 · FlashAttention.

**Dependencies:** `uv sync --extra dl --extra nlp`.

## Weekly plan

| Week | Topics | 🛠 Build |
|---|---|---|
| 37 | read *Attention Is All You Need* | written summary (`../papers/`) |
| 38 | scaled dot-product attention | implement it |
| 39 | multi-head attention | implement it |
| 40 | transformer block | residuals + layernorm + FFN |
| 41 | encoder | full encoder stack |
| 42 | decoder | masked attention, full decoder |
| 43 | tokenization | **BPE tokenizer from scratch** |
| 44 | positional embeddings | sinusoidal + learned |
| 45 | train mini-transformer | tiny dataset run |
| 46 | train GPT-like model | logging + checkpointing |
| 47 | text generation | greedy / temperature / top-k / top-p |
| 48 | **Capstone** | **nanoGPT reproduction** — train your own GPT |

## Capstone (Week 48)
Reproduce **nanoGPT**: train your own GPT and document everything. Portfolio projects #5
(transformer implementation) and #6 (GPT implementation) come out of this phase.

> Free GPU for training runs: Kaggle (T4, ~30h/wk), Colab, or rent from vast.ai/Lambda.
