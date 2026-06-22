# ROADMAP — AI From First Principles → Frontier AI

The canonical, merged curriculum. Each week lists **Topics → Build → Checkpoint → Resources**.
Per-phase `README.md` files are the trimmed local view; this is the full reference.

Legend: 🛠 = build artifact (the thing that marks the week done) · ✅ = checkpoint (can you do this?)

---

## Phase 0 — Setup (Week 0)

**Goal:** A working environment and the habits that make the next 18 months stick.

- 🛠 Run `bash setup.sh`; confirm `uv run python -c "import numpy, matplotlib"` works.
- 🛠 Launch `uv run jupyter lab` once.
- 🛠 Create your first note in `notes/weekly-notes.md`.
- 🛠 Watch all of **3Blue1Brown — Essence of Linear Algebra**.
- 🛠 Start **Karpathy Zero to Hero**: skim micrograd lesson 1 (you build it for real in Phase 3).
- ✅ You can run a test, edit code, and mark a week done with `track.py`.

**Resources:** Python 3.13 · uv · NumPy · Matplotlib · JupyterLab · Git. CS50P first if Python is shaky.

---

## Phase 1 — Math for Machine Learning (Weeks 1–8)

**Goal:** Enough linear algebra, calculus, and probability to read papers and implement backprop.
**Resources:** 3Blue1Brown (Linear Algebra, Calculus), MIT 18.06 (Strang), StatQuest,
Harvard Stat 110 (Blitzstein), *Mathematics for Machine Learning* (free, mml-book.github.io), Khan Academy.

| Week | Topics | 🛠 Build | ✅ Checkpoint |
|---|---|---|---|
| 1 | vectors, matrices, dot products | `matrix_multiply.py` (matmul by hand) + tests | Explain matrix multiplication without notes |
| 2 | linear transformations, basis vectors | 2D vector visualizer (matplotlib) | Show how a matrix warps the basis |
| 3 | eigenvalues, eigenvectors, SVD intuition | PCA intuition notebook | Explain what an eigenvector *is* |
| 4 | derivatives, gradients | gradient-descent visualization | Derive the GD update rule |
| 5 | partial derivatives, chain rule | manual backprop notebook | Hand-derive backprop for a 2-layer net |
| 6 | probability, Bayes | coin-flip simulations + tests | State Bayes' theorem and apply it |
| 7 | distributions, expectation, variance, entropy | distribution visualizer | Compute E[X], Var[X]; explain entropy |
| 8 | **Capstone** | Linear + Logistic Regression in **NumPy only** (no sklearn) + tests | Train both, explain the loss & gradients |

---

## Phase 2 — Classical ML & Classical AI (Weeks 9–16)

**Goal:** Understand the pre-deep-learning landscape; it makes everything later click.
**Resources:** Stanford CS229 (Ng), Berkeley CS188 / Stanford CS221, ISLR (free, statlearning.com),
Google ML Crash Course, StatQuest ML playlist, *Hands-On ML* (Géron).

| Week | Topics | 🛠 Build |
|---|---|---|
| 9 | linear regression (closed-form + GD) | linear regression from scratch |
| 10 | logistic regression, cross-validation | logistic regression from scratch |
| 11 | decision trees, entropy/gini | decision tree from scratch |
| 12 | random forests, bagging, boosting | random forest (ensemble of your trees) |
| 13 | k-means, naive Bayes | k-means from scratch |
| 14 | PCA, bias-variance, regularisation | PCA from scratch |
| 15 | classical AI: search, A*, heuristics, value iteration | implement A* |
| 16 | **Capstone** | **ML Playground**: classification + clustering + regression, all from scratch |

Also do one real tabular ML project on Kaggle data.

---

## Phase 3 — Neural Networks From First Principles + PyTorch (Weeks 17–28)

**Goal:** The single most important phase. Build backprop, MLPs, and a tiny framework yourself.
Do **not** start with LangChain or ChatGPT wrappers. Build everything.
**Spine:** Andrej Karpathy — *Neural Networks: Zero to Hero* (karpathy.ai/zero-to-hero.html,
github.com/karpathy/nn-zero-to-hero). Watch, close the video, rewrite it yourself.
**Supplements:** 3Blue1Brown NN series, fast.ai Part 1 & 2, d2l.ai, MIT 6.S191.
PyTorch (woven in from ~Week 22): pytorch.org/tutorials, Daniel Bourke's course. Install group `dl`.

| Week | Focus | 🛠 Build |
|---|---|---|
| 17 | micrograd part 1 | `Value` class (scalar autograd node) |
| 18 | autograd | full backward pass over the graph |
| 19 | backpropagation | topological sort + `.backward()` |
| 20 | MLP | multi-layer perceptron on top of `Value` |
| 21 | training | character classifier; loss tracking |
| 22 | optimization | SGD, Momentum, Adam (+ start PyTorch tensors/autograd) |
| 23 | activations | ReLU, Tanh, Sigmoid |
| 24 | regularization | dropout, batchnorm |
| 25–26 | language modeling | **makemore** (bigram → MLP → deeper) |
| 27–28 | **Capstone** | **Tiny NN framework**: autograd + optimizer + MLP + training loop |

A `micrograd/` starter (`value.py` + tests) is already scaffolded — start there in Week 17.

---

## Phase 4 — Deep Learning Breadth (Weeks 29–36)

**Goal:** Vision + sequence models before going deep on LLMs.
**Resources:** Stanford CS231n (vision), Stanford CS224N (NLP), Hugging Face NLP Course, d2l.ai. Group `dl` + `nlp`.

| Week | Topics | 🛠 Build |
|---|---|---|
| 29 | CNNs | image classifier |
| 30 | convolutions | conv2d from scratch |
| 31 | RNNs | char-RNN |
| 32 | LSTMs | LSTM on a language task |
| 33 | word embeddings | embeddings + t-SNE/UMAP visualization |
| 34 | sequence modeling | seq2seq |
| 35 | attention | attention mechanism from scratch |
| 36 | **Capstone** | sentiment classifier |

---

## Phase 5 — Transformers & LLMs (Weeks 37–48)

**Goal:** Where modern AI lives. Build a GPT end to end.
**Spine:** Stanford **CS336 — Language Modeling from Scratch** (stanford-cs336.github.io).
**Also:** Karpathy "Let's build GPT" & "Reproducing GPT-2", The Illustrated Transformer (Alammar),
Lilian Weng's blog, Yannic Kilcher walkthroughs, HF LLM Course. Group `nlp`.

**Papers (read alongside — see `papers/`):** Attention Is All You Need · BERT · GPT-2 · GPT-3 ·
InstructGPT · Chinchilla · LLaMA 1&2 · FlashAttention.

| Week | Topics | 🛠 Build |
|---|---|---|
| 37 | read *Attention Is All You Need* | written summary |
| 38 | scaled dot-product attention | implement it |
| 39 | multi-head attention | implement it |
| 40 | transformer block | residuals + layernorm + FFN |
| 41 | encoder | full encoder stack |
| 42 | decoder | full decoder stack (masked attention) |
| 43 | tokenization | **BPE tokenizer from scratch** |
| 44 | positional embeddings | sinusoidal + learned |
| 45 | train mini-transformer | tiny dataset run |
| 46 | train GPT-like model | with logging + checkpointing |
| 47 | text generation | sampling: greedy/temp/top-k/top-p |
| 48 | **Capstone** | **nanoGPT reproduction** — train your own GPT, document everything |

---

## Phase 6 — LLM Engineering (Weeks 49–60)

**Goal:** Stop being a prompt engineer. Retrieval, evaluation, fine-tuning, inference.
**Resources:** Full Stack Deep Learning (LLM Bootcamp), DataTalksClub LLM Zoomcamp, Hugging Face,
vLLM docs, CS336 systems sections. Groups `nlp`, `llmeng`, `posttrain`.

| Week | Topics | 🛠 Build |
|---|---|---|
| 49 | embeddings | embed a corpus |
| 50 | vector databases (Chroma/pgvector/Pinecone) | load + query a vector DB |
| 51 | semantic search | search over your corpus |
| 52 | RAG fundamentals | design a RAG pipeline |
| 53 | build simple RAG | end-to-end RAG |
| 54 | evaluation | retrieval + generation eval dataset |
| 55 | fine-tuning | instruction-tune a small open model |
| 56 | LoRA | LoRA fine-tune |
| 57 | quantization (GPTQ, bitsandbytes, QLoRA) | quantize a model |
| 58 | inference optimization (KV cache, batching) | measure latency/throughput |
| 59–60 | **Capstone** | **Production RAG system**: retrieval + evaluation + logging + metrics |

---

## Phase 7 — RLHF, Post-Training, Evals (Weeks 61–68)

**Goal:** How model behaviour is shaped — what separates real practitioners from "ChatGPT is the whole story."
**Resources:** OpenAI Spinning Up, Hugging Face Deep RL Course, Berkeley CS285, HF TRL docs,
InstructGPT paper, DPO paper, Tim Dettmers' blog. Groups `rl`, `posttrain`.

| Week | Topics | 🛠 Build |
|---|---|---|
| 61 | RL basics | gridworld agent |
| 62 | Q-learning | tabular Q-learning |
| 63 | policy gradients | REINFORCE |
| 64 | RLHF overview | reward-model sketch |
| 65 | preference datasets | build/curate a preference set |
| 66 | DPO | DPO fine-tune |
| 67 | evaluation frameworks | eval harness for a small model |
| 68 | **Capstone** | **Toy RLHF pipeline**: reward model + PPO loop (and/or a DPO run) |

---

## Phase 8 — Agentic Systems (Weeks 69–76)

**Goal:** The current frontier. Start with raw Python loops before any framework.
**Read first:** Anthropic — *Building Effective Agents* (simple, composable patterns > frameworks).
**Resources:** HF Agents Course, HF MCP Course, Berkeley LLM Agents (Fall 2024) & Advanced (Spring 2025),
LangGraph docs, AutoGen docs, OpenAI Platform docs.

| Week | Topics | 🛠 Build |
|---|---|---|
| 69 | raw tool calling | tool-calling loop, **no framework** |
| 70 | memory systems | short-term / long-term / episodic memory |
| 71 | planning loops | plan-and-execute |
| 72 | reflection patterns | self-critique loop |
| 73 | MCP (Model Context Protocol) | an MCP server/client |
| 74 | multi-agent systems | agents that delegate to each other |
| 75 | agent evaluation | traces, evals, explicit failure modes |
| 76 | **Capstone** | **AI Security Research Agent** (your edge): CVE lookup + threat-intel retrieval + smart-contract analysis + report generation. Alt: AI smart-contract auditor (static analysis + vuln DB + structured audit report). |

---

## Phase 9 — Research Apprenticeship (Weeks 77+, ongoing)

**Goal:** Become someone who reads, reproduces, and writes. This never ends.

- **Weekly:** read 1 paper, write a one-page summary (`papers/`).
- **Monthly:** reproduce one result from a paper you read.
- **Quarterly:** publish — blog post / GitHub project / technical writeup.
- **Graduation milestone:** a public repo + writeup reproducing or improving a real paper.

**Suggested reading order:** GPT-1 → GPT-2 → GPT-3 → BERT → InstructGPT → Chinchilla → LLaMA →
FlashAttention → Toolformer → ReAct → Constitutional AI.

**Where to find papers:** arXiv (cs.LG, cs.CL), huggingface.co/papers, paperswithcode.com,
distill.pub, Anthropic transformer-circuits.pub, AI Alignment Forum / LessWrong.

**Lab blogs:** Anthropic · OpenAI · Google DeepMind · Meta AI · EleutherAI.

---

## Phase 10 — Advanced Systems (Year 2+)

**Goal:** Go deep on infrastructure and research once the above is solid.

**Topics:** CUDA & GPU programming · distributed training at scale (DeepSpeed ZeRO, FSDP) ·
mechanistic interpretability · model-architecture research · alignment & safety · synthetic-data
pipelines · publishing your own experiments.

**Resources:** NVIDIA CUDA Programming Guide · Microsoft DeepSpeed tutorials ·
Anthropic transformer-circuits.pub · fast.ai Part 2 (advanced sections).

---

## Summary timeline (10–15 h/week)

| Phase | Focus | Duration |
|---|---|---|
| 0 | Setup | Week 0 |
| 1 | Math foundations | 4–8 weeks |
| 2 | Classical ML & AI | 6–8 weeks |
| 3 | Neural nets from scratch (Karpathy) | 2–3 months |
| 4 | Deep learning breadth | 2 months |
| 5 | Transformers & LLMs (CS336 + papers) | 2–3 months |
| 6 | LLM engineering & production | 2 months |
| 7 | Post-training, RL, alignment | 2 months |
| 8 | Agentic systems | 2 months |
| 9 | Research apprenticeship | Indefinite |
| 10 | Advanced systems | Year 2+ |
| **Total to strong practitioner** | | **~18–24 months** |
