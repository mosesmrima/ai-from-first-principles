#!/usr/bin/env python3
"""Progress tracker for the AI-from-first-principles curriculum.

Pure standard library — no dependencies. `progress.json` is the source of truth;
`PROGRESS.md` is a rendered view (regenerated on every `done`/`undo`/`render`).

Usage:
    python track.py status            # % complete, current phase, next item
    python track.py next              # the next unfinished milestone
    python track.py list [--phase 3]  # all milestones (optionally one phase)
    python track.py done week01       # mark a milestone complete
    python track.py undo week01        # un-mark it
    python track.py render            # rewrite PROGRESS.md from progress.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "progress.json"
PROGRESS_MD = ROOT / "PROGRESS.md"


# --- Seed -------------------------------------------------------------------
# (id, phase label, title). Edit titles freely; ids are stable handles.
def _seed() -> list[dict]:
    weeks = [
        ("week00", "Phase 0 — Setup", "Environment, first note, 3B1B Linear Algebra"),
        # Phase 1 — Math
        ("week01", "Phase 1 — Math", "Vectors, matrices, dot products → matrix_multiply.py"),
        ("week02", "Phase 1 — Math", "Linear transformations & basis → 2D vector visualizer"),
        ("week03", "Phase 1 — Math", "Eigenvalues/eigenvectors, SVD → PCA intuition notebook"),
        ("week04", "Phase 1 — Math", "Derivatives & gradients → gradient-descent viz"),
        ("week05", "Phase 1 — Math", "Partial derivatives & chain rule → manual backprop notebook"),
        ("week06", "Phase 1 — Math", "Probability & Bayes → coin-flip simulations"),
        ("week07", "Phase 1 — Math", "Distributions, expectation, variance → distribution visualizer"),
        ("week08", "Phase 1 — Math", "★ Capstone: Linear + Logistic Regression (NumPy only)"),
        # Phase 2 — Classical ML & AI
        ("week09", "Phase 2 — Classical ML", "Linear regression from scratch"),
        ("week10", "Phase 2 — Classical ML", "Logistic regression from scratch"),
        ("week11", "Phase 2 — Classical ML", "Decision trees from scratch"),
        ("week12", "Phase 2 — Classical ML", "Random forests"),
        ("week13", "Phase 2 — Classical ML", "K-means from scratch"),
        ("week14", "Phase 2 — Classical ML", "PCA from scratch"),
        ("week15", "Phase 2 — Classical ML", "Classical AI: search & A*"),
        ("week16", "Phase 2 — Classical ML", "★ Capstone: ML Playground (classify/cluster/regress)"),
        # Phase 3 — Neural Nets
        ("week17", "Phase 3 — Neural Nets", "micrograd part 1 — Value class"),
        ("week18", "Phase 3 — Neural Nets", "Autograd engine"),
        ("week19", "Phase 3 — Neural Nets", "Backpropagation"),
        ("week20", "Phase 3 — Neural Nets", "MLP"),
        ("week21", "Phase 3 — Neural Nets", "Train character classifier"),
        ("week22", "Phase 3 — Neural Nets", "Optimization (SGD/Momentum/Adam) + PyTorch intro"),
        ("week23", "Phase 3 — Neural Nets", "Activation functions (ReLU/Tanh/Sigmoid)"),
        ("week24", "Phase 3 — Neural Nets", "Regularization (dropout, batchnorm)"),
        ("week25", "Phase 3 — Neural Nets", "makemore (part 1)"),
        ("week26", "Phase 3 — Neural Nets", "makemore (part 2)"),
        ("week27", "Phase 3 — Neural Nets", "★ Capstone: Tiny NN framework (part 1)"),
        ("week28", "Phase 3 — Neural Nets", "★ Capstone: Tiny NN framework (part 2)"),
        # Phase 4 — Deep Learning Breadth
        ("week29", "Phase 4 — Deep Learning", "CNNs — image classifier"),
        ("week30", "Phase 4 — Deep Learning", "Convolutions from scratch"),
        ("week31", "Phase 4 — Deep Learning", "RNNs"),
        ("week32", "Phase 4 — Deep Learning", "LSTMs"),
        ("week33", "Phase 4 — Deep Learning", "Word embeddings + t-SNE/UMAP viz"),
        ("week34", "Phase 4 — Deep Learning", "Sequence modeling (seq2seq)"),
        ("week35", "Phase 4 — Deep Learning", "Attention mechanism from scratch"),
        ("week36", "Phase 4 — Deep Learning", "★ Capstone: sentiment classifier"),
        # Phase 5 — Transformers & LLMs
        ("week37", "Phase 5 — Transformers", "Read 'Attention Is All You Need' + summary"),
        ("week38", "Phase 5 — Transformers", "Scaled dot-product attention"),
        ("week39", "Phase 5 — Transformers", "Multi-head attention"),
        ("week40", "Phase 5 — Transformers", "Transformer block"),
        ("week41", "Phase 5 — Transformers", "Encoder"),
        ("week42", "Phase 5 — Transformers", "Decoder"),
        ("week43", "Phase 5 — Transformers", "BPE tokenizer from scratch"),
        ("week44", "Phase 5 — Transformers", "Positional embeddings"),
        ("week45", "Phase 5 — Transformers", "Train mini-transformer"),
        ("week46", "Phase 5 — Transformers", "Train GPT-like model"),
        ("week47", "Phase 5 — Transformers", "Text generation (sampling)"),
        ("week48", "Phase 5 — Transformers", "★ Capstone: nanoGPT reproduction"),
        # Phase 6 — LLM Engineering
        ("week49", "Phase 6 — LLM Engineering", "Embeddings"),
        ("week50", "Phase 6 — LLM Engineering", "Vector databases"),
        ("week51", "Phase 6 — LLM Engineering", "Semantic search"),
        ("week52", "Phase 6 — LLM Engineering", "RAG fundamentals"),
        ("week53", "Phase 6 — LLM Engineering", "Build simple RAG"),
        ("week54", "Phase 6 — LLM Engineering", "Evaluation"),
        ("week55", "Phase 6 — LLM Engineering", "Fine-tuning"),
        ("week56", "Phase 6 — LLM Engineering", "LoRA"),
        ("week57", "Phase 6 — LLM Engineering", "Quantization (GPTQ/bitsandbytes/QLoRA)"),
        ("week58", "Phase 6 — LLM Engineering", "Inference optimization (KV cache, batching)"),
        ("week59", "Phase 6 — LLM Engineering", "★ Capstone: Production RAG (part 1)"),
        ("week60", "Phase 6 — LLM Engineering", "★ Capstone: Production RAG (part 2)"),
        # Phase 7 — RLHF / Post-Training
        ("week61", "Phase 7 — RLHF", "RL basics"),
        ("week62", "Phase 7 — RLHF", "Q-learning"),
        ("week63", "Phase 7 — RLHF", "Policy gradients (REINFORCE)"),
        ("week64", "Phase 7 — RLHF", "RLHF overview"),
        ("week65", "Phase 7 — RLHF", "Preference datasets"),
        ("week66", "Phase 7 — RLHF", "DPO"),
        ("week67", "Phase 7 — RLHF", "Evaluation frameworks"),
        ("week68", "Phase 7 — RLHF", "★ Capstone: Toy RLHF pipeline"),
        # Phase 8 — Agents
        ("week69", "Phase 8 — Agents", "Raw tool calling (no framework)"),
        ("week70", "Phase 8 — Agents", "Memory systems"),
        ("week71", "Phase 8 — Agents", "Planning loops"),
        ("week72", "Phase 8 — Agents", "Reflection patterns"),
        ("week73", "Phase 8 — Agents", "MCP (Model Context Protocol)"),
        ("week74", "Phase 8 — Agents", "Multi-agent systems"),
        ("week75", "Phase 8 — Agents", "Agent evaluation"),
        ("week76", "Phase 8 — Agents", "★ Capstone: AI Security Research Agent"),
        # Phase 9 — Research (ongoing habits)
        ("research-graduation", "Phase 9 — Research", "Public repo + writeup reproducing/improving a paper"),
        # Phase 10 — Advanced
        ("advanced", "Phase 10 — Advanced", "Advanced systems track (Year 2+)"),
    ]
    portfolio = [
        ("portfolio01", "Portfolio", "Matrix algebra library"),
        ("portfolio02", "Portfolio", "Logistic regression from scratch"),
        ("portfolio03", "Portfolio", "Neural-network framework"),
        ("portfolio04", "Portfolio", "CNN classifier"),
        ("portfolio05", "Portfolio", "Transformer implementation"),
        ("portfolio06", "Portfolio", "GPT implementation"),
        ("portfolio07", "Portfolio", "Fine-tuned LLM"),
        ("portfolio08", "Portfolio", "Production RAG system"),
        ("portfolio09", "Portfolio", "Security AI agent"),
        ("portfolio10", "Portfolio", "Paper-reproduction project"),
    ]
    return [
        {"id": i, "phase": p, "title": t, "done": False}
        for (i, p, t) in (*weeks, *portfolio)
    ]


# --- Persistence ------------------------------------------------------------
def load() -> list[dict]:
    if DATA.exists():
        return json.loads(DATA.read_text())
    data = _seed()
    save(data)
    return data


def save(data: list[dict]) -> None:
    DATA.write_text(json.dumps(data, indent=2) + "\n")


def set_done(data: list[dict], milestone_id: str, value: bool) -> list[dict]:
    """Return a new list with `milestone_id` set to done=value (immutable update)."""
    if not any(m["id"] == milestone_id for m in data):
        sys.exit(f"Unknown milestone id: {milestone_id!r}. Try `python track.py list`.")
    return [{**m, "done": value} if m["id"] == milestone_id else m for m in data]


# --- Rendering --------------------------------------------------------------
def _bar(done: int, total: int, width: int = 30) -> str:
    filled = round(width * done / total) if total else 0
    return "[" + "#" * filled + "-" * (width - filled) + "]"


def render_markdown(data: list[dict]) -> str:
    total = len(data)
    done = sum(m["done"] for m in data)
    pct = round(100 * done / total) if total else 0
    lines = [
        "# PROGRESS",
        "",
        "_Auto-generated by `track.py`. Run `python track.py render` to refresh,",
        "or just mark items done with `python track.py done <id>`._",
        "",
        f"**{done}/{total} milestones complete — {pct}%**",
        "",
        f"`{_bar(done, total)}`",
        "",
    ]
    # Preserve seed order of phases.
    seen: list[str] = []
    for m in data:
        if m["phase"] not in seen:
            seen.append(m["phase"])
    for phase in seen:
        items = [m for m in data if m["phase"] == phase]
        pdone = sum(m["done"] for m in items)
        lines.append(f"## {phase}  ({pdone}/{len(items)})")
        lines.append("")
        for m in items:
            box = "x" if m["done"] else " "
            lines.append(f"- [{box}] `{m['id']}` — {m['title']}")
        lines.append("")
    return "\n".join(lines)


def write_progress_md(data: list[dict]) -> None:
    PROGRESS_MD.write_text(render_markdown(data))


# --- Commands ---------------------------------------------------------------
def first_undone(data: list[dict]) -> dict | None:
    return next((m for m in data if not m["done"]), None)


def cmd_status(data: list[dict]) -> None:
    total = len(data)
    done = sum(m["done"] for m in data)
    pct = round(100 * done / total) if total else 0
    nxt = first_undone(data)
    print(f"{_bar(done, total)}  {done}/{total}  ({pct}%)")
    if nxt:
        print(f"Current phase : {nxt['phase']}")
        print(f"Next up       : {nxt['id']} — {nxt['title']}")
    else:
        print("Everything is done. Go reproduce a paper. 🎓")


def cmd_next(data: list[dict]) -> None:
    nxt = first_undone(data)
    if nxt:
        print(f"{nxt['id']} — {nxt['title']}   ({nxt['phase']})")
    else:
        print("Nothing left. 🎓")


def cmd_list(data: list[dict], phase: str | None) -> None:
    for m in data:
        if phase and phase.lower() not in m["phase"].lower():
            continue
        box = "x" if m["done"] else " "
        print(f"[{box}] {m['id']:<20} {m['title']}")


def cmd_done(data: list[dict], milestone_id: str, value: bool) -> None:
    updated = set_done(data, milestone_id, value)
    save(updated)
    write_progress_md(updated)
    verb = "done" if value else "reopened"
    print(f"Marked {milestone_id} {verb}.")
    cmd_status(updated)


def cmd_render(data: list[dict]) -> None:
    write_progress_md(data)
    print(f"Wrote {PROGRESS_MD.relative_to(ROOT)}.")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Curriculum progress tracker.")
    sub = parser.add_subparsers(dest="cmd")
    sub.add_parser("status")
    sub.add_parser("next")
    p_list = sub.add_parser("list")
    p_list.add_argument("--phase", help="filter by phase substring, e.g. '3' or 'Math'")
    p_done = sub.add_parser("done")
    p_done.add_argument("id")
    p_undo = sub.add_parser("undo")
    p_undo.add_argument("id")
    sub.add_parser("render")

    args = parser.parse_args(argv)
    data = load()

    if args.cmd in (None, "status"):
        cmd_status(data)
    elif args.cmd == "next":
        cmd_next(data)
    elif args.cmd == "list":
        cmd_list(data, args.phase)
    elif args.cmd == "done":
        cmd_done(data, args.id, True)
    elif args.cmd == "undo":
        cmd_done(data, args.id, False)
    elif args.cmd == "render":
        cmd_render(data)


if __name__ == "__main__":
    main()
