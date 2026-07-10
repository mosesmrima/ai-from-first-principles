# Phase 8 — Agentic Systems (Weeks 69–76)

> **▶ Your ordered steps live in the tracker app → https://ai-tracker.mrima.workers.dev (open "Now"). This README is reference.**

**Goal:** the current frontier. Start with **raw Python loops before any framework.**

**Read this first:** Anthropic — *Building Effective Agents*
(anthropic.com/research/building-effective-agents). It argues for simple, composable patterns
over framework-heavy designs. Better framing than most courses.

**Dependencies:** base + your LLM client of choice (e.g. `anthropic` / `openai`). Add as needed.

## Resources
- Hugging Face Agents Course (huggingface.co/learn/agents-course)
- Hugging Face MCP Course (huggingface.co/learn/mcp-course)
- Berkeley LLM Agents (Fall 2024) & Advanced LLM Agents (Spring 2025) — rdi.berkeley.edu
- LangGraph docs · AutoGen docs · OpenAI Platform docs

## Weekly plan — build in this order

| Week | Topics | 🛠 Build |
|---|---|---|
| 69 | raw tool calling | tool-calling loop, **no framework** |
| 70 | memory systems | short-term / long-term / episodic |
| 71 | planning loops | plan-and-execute |
| 72 | reflection patterns | self-critique loop |
| 73 | MCP | an MCP server + client |
| 74 | multi-agent systems | agents that delegate to each other |
| 75 | agent evaluation | traces, evals, explicit failure modes |
| 76 | **Capstone** | **AI Security Research Agent** |

## Capstone (Week 76) — plays to your security background
Build an **AI Security Research Agent**:
- CVE lookup
- threat-intelligence retrieval
- smart-contract analysis (Solidity/Rust + static-analysis tools + known-vuln databases)
- structured audit/report generation

This combines your existing expertise with everything you've learned. Portfolio project #9 —
the most demonstrable, differentiated thing in your portfolio.
