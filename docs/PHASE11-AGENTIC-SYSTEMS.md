# Phase 11 — Agentic Systems Engineering

*A 10-week capstone phase for weeks 78–87 of the "AI from first principles" curriculum. Build-first. Every resource free, every URL from search results.*

> Research deliverable (2026-07-29). Not yet wired into `tracker/src/curriculum.ts` — appended weeks are safe to add (no step-ID reshuffling of existing weeks).

---

## 1. Landscape summary (mid-2026)

The agent field has finished its "framework maximalism" phase and settled into something closer to systems engineering. Three things are now genuinely settled. **First, the loop is boring and that's good.** An agent is a `while` loop: model → tool call → observation → append to context → repeat until done. Anthropic's [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) framing — workflows (prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer) versus true agents — has become the shared vocabulary, and [mini-swe-agent](https://github.com/SWE-agent/mini-swe-agent/) demonstrating >74% on SWE-bench Verified in ~100 lines with nothing but a bash tool is the strongest possible evidence that the *harness* — not the framework — is where the engineering lives. **Second, MCP won the tool-integration layer.** The [spec](https://modelcontextprotocol.io/specification/2025-11-25) is stable, SDKs are mature, and the interesting problems have moved up-stack: tool *design* (naming, response shaping, token budgets), and the emerging pattern of having agents write code that calls tools rather than emitting one tool call per turn. **Third, context engineering is the core discipline.** Compaction, sub-agent context isolation, file-system-as-memory, and "context rot" are now first-class engineering concerns with real literature behind them.

What is still moving, and where you should hold opinions loosely: **multi-agent is contested.** Anthropic reported ~90% improvement over single-agent on breadth-first research at ~15× token cost; meanwhile 2026 work from Stanford/Contextual argues that under a *fixed token budget* single agents match or beat multi-agent systems on multi-hop reasoning, and that independent (uncoordinated) topologies amplify errors ~17× versus ~4.4× for centralized orchestration. The honest teaching position: multi-agent buys you *parallel context windows*, not intelligence, and only pays when subtasks are genuinely separable. **A2A** reached v1.0 under the Linux Foundation with 150+ orgs, but adoption is real mainly inside enterprise cloud stacks — teach it as a one-session literacy topic, not a build week. **Computer-use agents** climbed from 12% (2024) to ~85% on OSWorld, but OSWorld 2.0 long-horizon tasks sit near 20% — the capability is real and the reliability is not. **RL for agents** is where the frontier research energy is, but it needs compute this learner doesn't have; teach it as reading, not building.

What to skip: framework tourism (do not spend a week each on LangGraph, CrewAI, AutoGen — build the loop yourself once, then read one framework's source to see what it added); AutoGPT-lineage autonomy hype; anything requiring a paid API tier beyond a few dollars of tokens.

What deserves disproportionate weight for **this** learner: security. The security story is unusually well-formed right now — Simon Willison's **lethal trifecta** (private data + untrusted content + exfiltration channel), Meta's **Agents Rule of Two**, the six **design patterns** paper (arXiv 2506.08837), the OWASP **Top 10 for Agentic Applications** (Dec 2025), plus two runnable adversarial benchmarks (**AgentDojo**, **AgentHarm**). A security auditor can go from zero to genuinely employable in this niche in three weeks, because almost nobody has both the agent-building and the red-team skillset. This phase gives it three of ten weeks and threads it through the capstone.

Structure below: loop → tools/MCP → context → memory/planning → orchestration → coordination & judges → security I (threat model) → security II (sandboxing & red-team) → evals & observability → capstone.

---

## 2. Proposed weeks

### Week 78 — The Agent Loop from Scratch
**Goal:** Write a working agent harness in <200 lines of Python with no framework, and understand every line of it.

**why:** Every production agent you will ever debug is this loop with more error handling. If you build it yourself once — the message list, the tool dispatch, the stop condition, the retry — no agent framework will ever be opaque to you again. This is the micrograd moment for agents: small enough to hold entirely in your head, real enough to actually do work.

**remember:**
- An agent is a loop over `model(messages) → tool_call → observation → messages.append(...)`; everything else is ergonomics.
- The three failure modes you'll meet in hour one — infinite loops, malformed tool args, and unbounded context — are the same three that break production systems.

| kind | title | resource | min |
|---|---|---|---|
| read | Building Effective Agents (workflows vs. agents; the five patterns) | https://www.anthropic.com/engineering/building-effective-agents | 45 |
| read | LLM Powered Autonomous Agents — the canonical planning/memory/tools decomposition | https://lilianweng.github.io/posts/2023-06-23-agent/ | 60 |
| watch | LLM Agents: History & Overview — Shunyu Yao (Berkeley MOOC) | https://www.youtube.com/watch?v=RM6ZArd2nVc | 75 |
| build | Bare loop v0: `while` loop, one `bash` tool, hand-rolled JSON tool parsing, hard turn limit. No SDK, no framework. | — | 150 |
| build | Add: structured tool registry, arg validation, error-as-observation (never crash — feed the traceback back to the model), and a `finish` tool as the stop condition. | — | 120 |
| read | mini-swe-agent README + read `agent.py` line by line; diff its choices against yours | https://github.com/SWE-agent/mini-swe-agent/ | 60 |
| paper | ReAct — read as the origin of thought/action/observation | https://arxiv.org/abs/2210.03629 | 60 |
| note | Write up: "the 6 design decisions in my loop and what each one trades away" | — | 30 |
| checkpoint | Your loop solves 3 real tasks in a scratch git repo (rename a symbol across files; find and fix a failing test; summarise a codebase) without you touching the keyboard mid-run | — | 30 |

**Papers:** ReAct: Synergizing Reasoning and Acting in Language Models — https://arxiv.org/abs/2210.03629 — ~10pp main text (+~23pp appendix) — 60 min for main text.

---

### Week 79 — Tools, Schemas, and MCP
**Goal:** Design tools an agent can actually use well, and ship a real MCP server your Week-78 loop connects to.

**why:** Anthropic found that refining *tool descriptions alone* moved SWE-bench Verified results materially — tool design is a first-class engineering surface, not glue code. MCP is now the standard socket between agents and the world, and writing a server is the fastest way to understand what an agent can and can't see. As a security person, note that every tool you add is an entry in an attack surface inventory.

**remember:**
- Tool *responses* are prompts. Shape them for token economy and unambiguous next-step signalling, not for machine tidiness.
- MCP has three primitives — tools, resources, prompts — over JSON-RPC; most people only ever use tools, and often shouldn't.

| kind | title | resource | min |
|---|---|---|---|
| read | Writing effective tools for AI agents — using AI agents | https://www.anthropic.com/engineering/writing-tools-for-agents | 50 |
| read | Introducing the Model Context Protocol | https://www.anthropic.com/news/model-context-protocol | 20 |
| read | MCP specification (2025-11-25) — architecture, tools/resources/prompts, transports | https://modelcontextprotocol.io/specification/2025-11-25 | 75 |
| build | HF MCP Course Unit 1 + build a stdio MCP server exposing 3 tools over a domain you know (e.g. a log-search / IOC-lookup / CVE-lookup toolset) | https://huggingface.co/learn/mcp-course/en/unit0/introduction | 180 |
| build | Wire your MCP server into your Week-78 loop as an MCP *client*. No SDK shortcuts on the client side — parse JSON-RPC yourself once. | https://github.com/modelcontextprotocol | 120 |
| build | Tool-description A/B: run the same 5 tasks with terse vs. rich tool descriptions and response shapes; record token cost and success rate. | — | 90 |
| read | Advanced tool use (tool search, programmatic tool calling, tool-result shaping) | https://www.anthropic.com/engineering/advanced-tool-use | 40 |
| note | "Tool design checklist" in your notes: naming, error text, pagination, idempotence, blast radius | — | 30 |

**Papers:** Toolformer: Language Models Can Teach Themselves to Use Tools — https://arxiv.org/abs/2302.04761 — ~12pp main — 45 min (historical framing; skim the training details).

---

### Week 80 — Context Engineering: Compaction, Isolation, Context Rot
**Goal:** Make your harness survive a 200-turn session without degrading — add compaction, file-backed context, and sub-agent isolation.

**why:** Long-running coding sessions routinely span millions of tokens across 100+ turns, and model quality degrades measurably *before* the context limit — the "context rot" effect. Every real harness (Claude Code included) is fundamentally a context-management system with a model attached. This is the week your toy becomes a tool.

**remember:**
- Context is a budget you allocate, not a bucket you fill. Curate what enters the attention window each turn.
- Compaction is lossy and the losses are adversarial: safety constraints and early instructions are exactly what rolling summaries drop first.

| kind | title | resource | min |
|---|---|---|---|
| read | Effective context engineering for AI agents | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | 60 |
| read | Effective harnesses for long-running agents (initializer agent, artifacts between sessions) | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents | 50 |
| read | 12-Factor Agents — own your prompts, context, control flow, state | https://github.com/humanlayer/12-factor-agents | 75 |
| build | Add rolling summarisation compaction at a token threshold; preserve a pinned "constitution" block that compaction can never touch. | — | 150 |
| build | Add filesystem-as-memory: agent writes notes/artifacts to disk, and the context holds *pointers*, not contents. | — | 120 |
| build | Add a `spawn_subagent(instruction, tools)` primitive that runs a fresh context and returns only a summary. Measure token savings on a research task. | — | 120 |
| read | Claude Code best practices — read as a case study of a production harness's context discipline | https://code.claude.com/docs/en/best-practices | 40 |
| checkpoint | Run a 100+ turn task end-to-end. Log context size per turn. Prove compaction didn't drop a constraint (plant a canary instruction and check it survives). | — | 45 |

**Papers:** MemGPT: Towards LLMs as Operating Systems — https://arxiv.org/abs/2310.08560 — ~20pp — 70 min. (Read now, not in the memory week: it's the OS-paging metaphor that makes compaction click.)

---

### Week 81 — Memory and Planning
**Goal:** Give your agent persistent memory across sessions and an explicit plan artifact it maintains and revises.

**why:** Statelessness is the reason most agents feel like goldfish. Real memory systems split into two philosophies — a bolt-on memory *layer* (Mem0) versus a stateful agent *runtime* (Letta/MemGPT) — and knowing the difference tells you which one you're actually building. Planning as an explicit, inspectable artifact is also the cheapest reliability win available: a plan you can read is a plan you can audit.

**remember:**
- Extraction + retrieval beats "stuff everything in context": Mem0's ECAI 2025 results showed ~90% lower token cost and ~91% lower p95 latency vs. full-context on LoCoMo.
- A todo/plan file the agent rewrites each turn is a poor man's planner that outperforms most clever planning machinery — and it's auditable.

| kind | title | resource | min |
|---|---|---|---|
| build | Memory v1: episodic log + extraction step ("what's worth remembering from this session?") + retrieval at session start | — | 150 |
| build | Memory v2: add typed memory (facts / preferences / procedures) and a memory-conflict resolution rule. Test on a 3-session continuity scenario. | — | 120 |
| build | Explicit plan artifact: agent writes `PLAN.md`, marks steps done, and revises on failure. Compare task success with/without. | — | 90 |
| read | Mem0 vs Letta — architecture comparison (memory layer vs. agent runtime) | https://vectorize.io/articles/mem0-vs-letta | 30 |
| read | How AI agents actually remember — Mem0, Supermemory, Letta internals | https://kenhuangus.substack.com/p/how-ai-agents-actually-remember-inside | 40 |
| watch | LLM Reasoning — Denny Zhou (Berkeley MOOC) — planning/decomposition foundations | https://www.youtube.com/watch?v=QL-FS_Zcmyo | 70 |
| note | Diagram your memory architecture and mark, for each store, *who can write to it* — a poisoned memory is a persistent prompt injection | — | 40 |

**Papers:**
- Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory — https://arxiv.org/abs/2504.19413 — ~15pp — 55 min.
- Reflexion: Language Agents with Verbal Reinforcement Learning — https://arxiv.org/abs/2303.11366 — ~14pp — 50 min.
- Tree of Thoughts — https://arxiv.org/abs/2305.10601 — ~14pp — 50 min (skim; read for the search-over-plans framing).

---

### Week 82 — Orchestration: Orchestrator/Worker, Fan-out, and Protocols
**Goal:** Build a real orchestrator that decomposes a task, fans out parallel subagents, and merges results — then measure whether it was worth it.

**why:** Multi-agent is the most over-sold and under-measured idea in the field. Anthropic's research system beat single-agent by ~90% on breadth-first research at ~15× token cost; 2026 work argues single agents win under fixed token budgets on multi-hop reasoning. Both are true, for different task shapes, and knowing *which shape you have* is the whole skill.

**remember:**
- Multi-agent buys parallel *context windows*, not parallel *intelligence*. It pays for separable, breadth-first work; it hurts on tightly coupled work like editing one codebase.
- Topology determines error amplification: centralized orchestration contains errors far better than independent agents (~4.4× vs ~17× amplification in 2026 measurements).

| kind | title | resource | min |
|---|---|---|---|
| read | How and when to build multi-agent systems (LangChain — the skeptical case) | https://www.langchain.com/blog/how-and-when-to-build-multi-agent-systems | 40 |
| watch | Multi-Agent Systems in the Era of LLMs — Oriol Vinyals (Berkeley MOOC F25) | https://www.youtube.com/watch?v=ntjOxjZMaac | 70 |
| watch | Agentic AI Frameworks / AutoGen + multimodal assistant (Berkeley MOOC) | https://www.youtube.com/watch?v=OOdtmCMSOo4 | 70 |
| build | Orchestrator/worker: lead agent decomposes into N independent subtasks, spawns N workers in parallel (asyncio), merges with an explicit synthesis prompt. | — | 180 |
| build | **The honest experiment:** run the same 10 tasks single-agent vs. orchestrated at *matched total token budget*. Record success, tokens, wall-clock. Write down which task shapes flipped. | — | 120 |
| read | A2A protocol literacy — what agent cards are, when cross-org agent interop matters | https://opensource.googleblog.com/2026/04/a-year-of-open-collaboration-celebrating-the-anniversary-of-a2a.html | 30 |
| read | Web of Agents — the unified narrative from MAS → agentic AI (skim for framing) | https://arxiv.org/abs/2507.10644 | 45 |
| note | Decision rule you'll actually use: "when do I fan out?" — three bullets, with your own numbers behind them | — | 30 |

**Papers:**
- Why Do Multi-Agent LLM Systems Fail? (MAST taxonomy — 14 failure modes) — https://arxiv.org/abs/2503.13657 — ~25pp — 80 min. **Read the taxonomy table twice.**
- From Multi-Agent Systems and the Semantic Web to Agentic AI — https://arxiv.org/abs/2507.10644 — ~30pp — 45 min (skim).

---

### Week 83 — Harmonisation: Judges, Verifiers, Debate, and Consensus
**Goal:** Build the evaluator-optimizer loop — a verifier agent that gates the worker's output — and learn where LLM judges lie to you.

**why:** The single highest-leverage multi-agent pattern isn't parallelism, it's *verification*: a second model whose only job is to say "no, redo it." MAST's third failure cluster is literally "task verification." And since you'll use LLM judges for the rest of your career to score evals, you need to know their biases (position, verbosity, self-preference) before you trust one.

**remember:**
- Generator + verifier is the cheapest reliability multiplier in agent design; a *cheap* verifier on an *expensive* generator is often the right cost shape.
- Judges are biased instruments. Calibrate every judge against human labels before it grades anything you care about.

| kind | title | resource | min |
|---|---|---|---|
| build | Evaluator-optimizer loop: worker produces, verifier critiques against an explicit rubric, worker revises, max N rounds. Apply to a code-fix task. | — | 150 |
| build | Judge calibration: hand-label 30 agent outputs, then measure your LLM judge's agreement (Cohen's kappa) against your labels. Fix the rubric until kappa > 0.7. | — | 120 |
| build | Debate / N-sample consensus: 3 independent workers → judge picks or synthesises. Compare against single-worker at matched cost. | — | 100 |
| paper | LLMs-as-Judges: a comprehensive survey — read § on biases and mitigations | https://arxiv.org/abs/2412.05579 | 80 |
| read | From Generation to Judgment: opportunities and challenges of LLM-as-a-judge | https://arxiv.org/abs/2411.16594 | 60 |
| note | Write your house rubric template: criteria, anchors, tie-breaks, and the bias mitigations you applied (position swap, blind refs) | — | 40 |

**Papers:**
- LLMs-as-Judges: A Comprehensive Survey on LLM-based Evaluation Methods — https://arxiv.org/abs/2412.05579 — ~35pp — 80 min (read selectively).
- From Generation to Judgment — https://arxiv.org/abs/2411.16594 — ~30pp — 60 min.

---

### Week 84 — Agent Security I: Threat Modelling and Prompt Injection
**Goal:** Produce a formal threat model of your own agent, and understand why prompt injection is architectural, not a filtering problem.

**why:** This is your home turf and the field's weakest spot. Prompt injection is an unsolved *fundamental* weakness — no model-level defense holds under adaptive attack — so the defensible answer is architecture: constrain what a compromised agent is *permitted* to do. You already know how to write a threat model; this week you learn the agentic asset/trust-boundary vocabulary to put in it.

**remember:**
- **Lethal trifecta:** private data + untrusted content + external communication. Any two is survivable; all three is a data-exfiltration primitive.
- **Rule of Two:** an agent may satisfy at most two of {untrusted input, sensitive data access, state change / external comms} within a single session — otherwise require human approval or start a fresh session.

| kind | title | resource | min |
|---|---|---|---|
| read | The lethal trifecta for AI agents | https://simonwillison.net/series/prompt-injection/ | 60 |
| read | Agents Rule of Two: a practical approach to AI agent security (Meta) | https://ai.meta.com/blog/practical-ai-agent-security/ | 40 |
| read | New prompt injection papers: Agents Rule of Two and The Attacker Moves Second | https://simonwillison.net/2025/Nov/2/new-prompt-injection-papers/ | 35 |
| read | Design Patterns for Securing LLM Agents against Prompt Injections — Willison's walkthrough of the six patterns | https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/ | 40 |
| read | OWASP Top 10 for Agentic Applications (2026) | https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/ | 75 |
| read | OWASP LLM Prompt Injection Prevention cheat sheet | https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html | 30 |
| build | **Threat model your Week-78→83 agent**: asset inventory, trust boundaries per tool, data-flow diagram, trifecta audit per tool combination, STRIDE-style table. This is a real artifact you can show an employer. | — | 180 |
| build | Implement the **dual-LLM / quarantined-LLM** pattern in your harness: a privileged agent that never reads untrusted bytes, and a quarantined agent that reads them but holds no tools. | — | 120 |

**Papers:**
- Design Patterns for Securing LLM Agents against Prompt Injections — https://arxiv.org/abs/2506.08837 — ~25pp — 90 min. **The single most useful security paper in this phase.**
- Open Challenges in Multi-Agent Security — https://arxiv.org/abs/2505.02077 — ~20pp — 60 min.

---

### Week 85 — Agent Security II: Sandboxing, Least Privilege, and Red-Teaming Your Own Agent
**Goal:** Sandbox your agent properly and then break it — run AgentDojo against your own harness and log every success.

**why:** Defense-in-depth for agents converges on four layers everywhere: network egress control, filesystem boundaries, secrets scoping, and config protection. And the only way to know whether your defenses work is adaptive attack — published research repeatedly shows adaptive attacks break defenses that reported >90% robustness under static evaluation. Red-teaming your own creation is the auditor's version of TDD.

**remember:**
- Isolation ladder: hardened container → gVisor (user-space kernel, pragmatic middle) → microVM/Firecracker (own kernel, ~125ms boot). Pick by blast radius, not by fashion.
- A defense that hasn't been evaluated *adaptively* has not been evaluated.

| kind | title | resource | min |
|---|---|---|---|
| read | How to sandbox AI agents in 2026: microVMs, gVisor & isolation strategies | https://northflank.com/blog/how-to-sandbox-ai-agents | 45 |
| read | AI agent sandboxing compared: Docker, E2B, Firecracker, gVisor, Modal, Daytona | https://amux.io/guides/ai-agent-sandboxing/ | 40 |
| build | Re-host your agent in a locked-down container: read-only rootfs where possible, non-root, no ambient credentials, explicit egress allowlist, per-tool capability tokens. Document what each control blocks. | — | 150 |
| build | Run **AgentDojo** against your harness. Record benign utility, utility-under-attack, and attack success rate — before and after your Week-84 dual-LLM pattern. | https://arxiv.org/abs/2406.13352 | 180 |
| build | Write 10 of your own indirect-injection payloads targeting *your* tool set (poisoned file contents, poisoned MCP tool responses, poisoned memory writes). Any that work go in a regression suite. | — | 120 |
| read | AgentHarm dataset — misuse-robustness framing and how the tasks are scored | https://huggingface.co/datasets/ai-safety-institute/AgentHarm | 45 |
| checkpoint | Produce a short security report on your own agent: findings, severity, mitigations, residual risk. Auditor's format. | — | 60 |

**Papers:**
- AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents — https://arxiv.org/abs/2406.13352 — ~30pp — 90 min.
- AgentHarm: A Benchmark for Measuring Harmfulness of LLM Agents — https://arxiv.org/abs/2410.09024 — ~20pp — 60 min.
- Adaptive Attacks Break Defenses Against Indirect Prompt Injection — https://arxiv.org/abs/2503.00061 — ~18pp — 55 min.

---

### Week 86 — Evals and Observability
**Goal:** Build a real eval suite for your agent in Inspect AI, and instrument every run with OpenTelemetry traces into Langfuse.

**why:** Eval-driven development is what separates people who *ship* agents from people who *demo* them. Public benchmarks tell you where the field is; your own eval suite tells you whether your last commit helped. Tracing is the debugger — without per-turn spans you are reading tea leaves when a 60-turn run goes wrong.

**remember:**
- Benchmark literacy matters: SWE-bench Verified leaders sit near 94% while ~20% of "solved" cases are semantically wrong; OSWorld 2.0 long-horizon sits near 20%. Headline numbers are harness-dependent, not model-dependent.
- Trace first, eval second. You cannot score what you cannot replay.

| kind | title | resource | min |
|---|---|---|---|
| read | Survey on Evaluation of LLM-based Agents — read the taxonomy sections | https://arxiv.org/abs/2503.16416 | 90 |
| build | Learn Inspect AI: dataset → Task → Solver → Scorer, sandboxing, log viewer | https://inspect.aisi.org.uk/ | 120 |
| build | Write a 25-task eval suite for *your* agent's domain in Inspect: 15 capability tasks, 5 regression tasks from bugs you hit, 5 security tasks from Week 85. | https://github.com/UKGovernmentBEIS/inspect_ai | 180 |
| build | Instrument the harness with OTel spans (one per turn: model call, tool call, compaction event) → Langfuse. Replay a failed run from traces alone. | https://langfuse.com/docs/observability/get-started | 120 |
| read | Langfuse ↔ OpenTelemetry GenAI semantic conventions | https://langfuse.com/integrations/native/opentelemetry | 30 |
| read | Skim benchmark sources: SWE-bench, τ²-bench, AgentBench, WebArena repos — read the *task format*, not the leaderboards | https://github.com/SWE-bench/SWE-bench · https://github.com/sierra-research/tau2-bench · https://github.com/THUDM/AgentBench · https://github.com/web-arena-x/visualwebarena | 60 |
| note | "How I'd evaluate an agent I'm auditing" — a one-page methodology | — | 40 |

**Papers:**
- Survey on Evaluation of LLM-based Agents — https://arxiv.org/abs/2503.16416 — ~40pp — 90 min (read §1–3 + §5 closely).
- SWE-bench: Can Language Models Resolve Real-World GitHub Issues? — https://arxiv.org/abs/2310.06770 — ~25pp — 60 min.
- GAIA: a benchmark for General AI Assistants — https://arxiv.org/abs/2311.12983 — ~18pp — 45 min.
- τ-bench: Tool-Agent-User Interaction — https://arxiv.org/abs/2406.12045 — ~20pp — 50 min (note `pass^k` — the reliability metric everyone should use and nobody does).

---

### Week 87 — Capstone: A Secured, Orchestrated, Evaluated Multi-Agent System
**Goal:** Ship one complete system — orchestrator + specialised subagents + MCP tools + memory + sandbox + eval suite + trace dashboard — and write it up.

**why:** Everything in Phase 11 exists to be composed once. This is the artifact that proves the whole 87 weeks: not a notebook, a *system*, with numbers attached and a threat model in the repo. For a security auditor, the natural build is an agentic security-review system — which happens to be one of the most commercially live agent applications in 2026.

**remember:**
- Ship with numbers: capability score, cost per task, attack success rate, p95 latency. An agent without an eval suite is a demo.
- The write-up is half the value. "Here is what I built, here is how I broke it, here is what held" is the portfolio piece.

| kind | title | resource | min |
|---|---|---|---|
| build | **Day 1 — Design.** Pick the system (suggested: *automated security review agent* — orchestrator fans out per-file/per-module reviewer subagents, a verifier judge filters false positives, memory holds project conventions, sandbox holds the repo). Write the design doc + threat model first. | — | 120 |
| build | **Day 2 — Orchestrator + workers.** Decomposition, parallel fan-out, structured result contract, synthesis step. Reuse Week 82 code. | — | 130 |
| build | **Day 3 — Tools + memory.** MCP server for the domain tools; persistent memory of accepted/rejected findings so it stops repeating dismissed ones. | — | 130 |
| build | **Day 4 — Verifier + guardrails.** Judge agent with the calibrated rubric from Week 83; human-in-the-loop approval gate on any state-changing action (Rule of Two enforcement in code). | — | 130 |
| build | **Day 5 — Security hardening + red team.** Sandbox, egress allowlist, least-privilege tool tokens. Then attack it with your Week-85 payload suite and fix what breaks. | — | 130 |
| build | **Day 6 — Evals + observability.** Run the Inspect suite; publish capability score, cost/task, ASR, p95 latency; screenshots of Langfuse traces. | — | 130 |
| note | **Day 7 — Write-up + retrospective.** README with architecture diagram, results table, threat model, and an honest "what I'd do differently" section. Publish it. | — | 120 |
| checkpoint | Repo is public, eval suite runs green in one command, and the README's numbers are reproducible by a stranger. | — | 45 |

**Papers (optional, capstone week — read only if you have slack):**
- The Landscape of Agentic Reinforcement Learning for LLMs: A Survey — https://arxiv.org/abs/2509.02547 — ~60pp — 90 min skim. Read the taxonomy to know what's next.
- SWE-RL: Advancing LLM Reasoning via RL on Open Software Evolution — https://arxiv.org/abs/2502.18449 — ~20pp — 50 min.

---

## 3. Top 10 papers for the phase (ranked)

1. **Design Patterns for Securing LLM Agents against Prompt Injections** — https://arxiv.org/abs/2506.08837 — Six architectural patterns with provable-ish injection resistance; the only paper that turns "prompt injection is unsolvable" into a design discipline. Highest value-per-page for this learner.
2. **Why Do Multi-Agent LLM Systems Fail?** (MAST) — https://arxiv.org/abs/2503.13657 — 14 empirically-derived failure modes across 7 frameworks; it is the debugging checklist for every multi-agent system you will ever build or audit.
3. **ReAct: Synergizing Reasoning and Acting** — https://arxiv.org/abs/2210.03629 — The thought/action/observation loop that every harness in production is still running, four years later.
4. **AgentDojo** — https://arxiv.org/abs/2406.13352 — A runnable, stateful adversarial environment with the right three metrics (benign utility, utility-under-attack, ASR); turns agent security from opinion into measurement.
5. **MemGPT: Towards LLMs as Operating Systems** — https://arxiv.org/abs/2310.08560 — The virtual-memory metaphor that makes compaction, paging, and context hierarchy obvious; still the mental model behind Letta and most memory systems.
6. **Survey on Evaluation of LLM-based Agents** — https://arxiv.org/abs/2503.16416 — The map of the entire eval landscape and, more usefully, its gaps: cost-efficiency, safety, robustness, granularity.
7. **τ-bench** — https://arxiv.org/abs/2406.12045 — Introduces `pass^k` for *reliability across trials* rather than best-of-n success; the metric that most honestly reflects whether an agent can be deployed.
8. **Mem0: Scalable Long-Term Memory** — https://arxiv.org/abs/2504.19413 — First broad head-to-head of ten memory approaches with real latency/cost numbers; settles the "why not just use full context" argument empirically.
9. **AgentHarm** — https://arxiv.org/abs/2410.09024 — Misuse robustness measured on *multi-step agentic* behaviour rather than single-turn refusals; the distinction that matters once tools are attached.
10. **The Landscape of Agentic Reinforcement Learning for LLMs: A Survey** — https://arxiv.org/abs/2509.02547 — The forward-looking one: how agents stop being prompted and start being trained. Read it to know what Phase 12 would be.

*Runners-up worth knowing exist:* Reflexion (https://arxiv.org/abs/2303.11366), SWE-bench (https://arxiv.org/abs/2310.06770), GAIA (https://arxiv.org/abs/2311.12983), Open Challenges in Multi-Agent Security (https://arxiv.org/abs/2505.02077), Adaptive Attacks Break Defenses (https://arxiv.org/abs/2503.00061).

---

## 4. Sources consulted

**Engineering blogs / primary vendor writing**
- https://www.anthropic.com/engineering/building-effective-agents
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://www.anthropic.com/engineering/writing-tools-for-agents
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- https://www.anthropic.com/engineering/advanced-tool-use
- https://www.anthropic.com/news/model-context-protocol
- https://code.claude.com/docs/en/best-practices
- https://code.claude.com/docs/en/agent-sdk/overview
- https://claude.com/blog/building-agents-with-the-claude-agent-sdk
- https://ai.meta.com/blog/practical-ai-agent-security/
- https://www.langchain.com/blog/how-and-when-to-build-multi-agent-systems
- https://lilianweng.github.io/posts/2023-06-23-agent/
- https://simonwillison.net/series/prompt-injection/
- https://simonwillison.net/2025/Nov/2/new-prompt-injection-papers/
- https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/
- https://opensource.googleblog.com/2026/04/a-year-of-open-collaboration-celebrating-the-anniversary-of-a2a.html
- https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year

**Courses (all free)**
- https://huggingface.co/learn/agents-course · https://github.com/huggingface/agents-course
- https://huggingface.co/learn/mcp-course/en/unit0/introduction
- https://rdi.berkeley.edu/agentic-ai/f25 · https://agenticai-learning.org/f25
- Berkeley MOOC lectures: https://www.youtube.com/watch?v=RM6ZArd2nVc · https://www.youtube.com/watch?v=QL-FS_Zcmyo · https://www.youtube.com/watch?v=r1qZpYAmqmg · https://www.youtube.com/watch?v=ntjOxjZMaac · https://www.youtube.com/watch?v=OOdtmCMSOo4

**Repos**
- https://github.com/SWE-agent/mini-swe-agent/ · https://github.com/OpenHands/OpenHands · https://github.com/All-Hands-AI
- https://github.com/modelcontextprotocol · https://modelcontextprotocol.io/specification/2025-11-25
- https://github.com/humanlayer/12-factor-agents
- https://github.com/UKGovernmentBEIS/inspect_ai · https://inspect.aisi.org.uk/ · https://github.com/UKGovernmentBEIS/inspect_evals · https://github.com/UKGovernmentBEIS/inspect_k8s_sandbox
- https://github.com/langfuse/langfuse · https://langfuse.com/docs/observability/get-started · https://langfuse.com/integrations/native/opentelemetry
- https://github.com/SWE-bench/SWE-bench · https://github.com/sierra-research/tau2-bench · https://github.com/THUDM/AgentBench · https://github.com/web-arena-x/visualwebarena
- https://huggingface.co/datasets/ai-safety-institute/AgentHarm
- https://github.com/VoltAgent/awesome-ai-agent-papers · https://github.com/walkinglabs/awesome-harness-engineering · https://github.com/llm-as-a-judge/Awesome-LLM-as-a-judge

**Security references**
- https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- https://genai.owasp.org/2025/12/09/owasp-genai-security-project-releases-top-10-risks-and-mitigations-for-agentic-ai-security/
- https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- https://northflank.com/blog/how-to-sandbox-ai-agents · https://amux.io/guides/ai-agent-sandboxing/

**Landscape / analysis**
- https://benchmarkingagents.com/agent-benchmarks/ · https://benchmarkingagents.com/osworld/
- https://zylos.ai/research/2026-02-08-computer-use-gui-agents/ · https://zylos.ai/research/2026-04-21-agent-context-compaction-long-running-sessions/
- https://vectorize.io/articles/mem0-vs-letta · https://kenhuangus.substack.com/p/how-ai-agents-actually-remember-inside
- https://explainx.ai/blog/top-10-open-closed-source-agent-harnesses-2026 · https://www.flowhunt.io/blog/multi-agent-ai-system/
