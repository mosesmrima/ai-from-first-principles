# Frontier Topics — What Else Became Industry-Defining in 2025–2026

*An 8-week research-backed phase. Recommended slot: **before** the agentic phase — i.e. Phase 11: Frontier Topics → Phase 12: Agentic Systems Engineering (see note). Companion to [PHASE11-AGENTIC-SYSTEMS.md](./PHASE11-AGENTIC-SYSTEMS.md).*

> Research deliverable (2026-07-29). Not yet wired into `tracker/src/curriculum.ts`.

**Recommended ordering:** teach this phase **first**, then the agentic phase. Reasoning models, RLVR, inference economics, and interpretability are *upstream* of agents: every serious agent harness in 2026 runs on a reasoning model, budgets test-time compute, and is audited with interp/safety techniques. The agentic phase also makes the better final capstone since it composes everything. The phases are loosely coupled enough to run in either order if renumbering is painful.

---

## 1. Landscape summary (mid-2026)

Between late 2024 and mid-2026, four things moved from research to industry-defining, settled practice. **(1) Reasoning models and test-time compute.** o1 showed that spending inference tokens on chain-of-thought scales performance; [DeepSeek-R1](https://arxiv.org/abs/2501.12948) showed that pure RL with verifiable rewards (RLVR) elicits it in open models, and [s1](https://arxiv.org/abs/2501.19393) showed a distilled 1K-sample version works. GRPO (from [DeepSeekMath](https://arxiv.org/abs/2402.03300)) became the default RL algorithm, with free, runnable implementations in [TRL](https://huggingface.co/learn/llm-course/en/chapter12/4). This is settled enough to teach and cheap enough to reproduce on a free Colab. **(2) Inference optimization.** PagedAttention/vLLM, quantization (GPTQ/AWQ), speculative decoding, and KV-cache engineering are now the economic substrate of all deployed AI, are stable, and are ideal from-scratch builds on CPU. **(3) The architecture consensus:** sparse MoE + long context ([Mixtral](https://arxiv.org/pdf/2401.04088), DeepSeek-V3) won; a from-scratch MoE layer is a one-evening build. **(4) Mechanistic interpretability** matured from curiosity to audit tooling — sparse autoencoders ([Scaling Monosemanticity](https://transformer-circuits.pub/2024/scaling-monosemanticity/)), attribution graphs ([Biology of a Large Language Model](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)) — with outstanding free pedagogy (ARENA, Neel Nanda). For a security auditor this is a career-relevant differentiator, as are the empirical safety results ([alignment faking](https://arxiv.org/abs/2412.14093), [emergent misalignment](https://arxiv.org/html/2502.17424v3)). Small models + distillation + synthetic data round it out — Karpathy's [nanochat](https://github.com/karpathy/nanochat) is the single best full-stack artifact of 2025 for this learner.

**Considered and deliberately excluded:** **World models & video generation** (Sora/Genie-class) — genuinely frontier, but compute-inaccessible, API-gated, fast-moving, and off this learner's career path; demoted to one survey reading. **VLA / robotics foundation models** — require hardware and are pre-consolidation; excluded. **Multimodal VLMs** — important but the learner's marginal value is low vs. reasoning/inference/interp; demoted to survey reading. **Diffusion language models** ([LLaDA](https://arxiv.org/abs/2502.09992), Mercury, Gemini Diffusion) — a real 2025–26 storyline but unsettled; one paper in the survey week, not a week. **Modern RAG** — already covered in the curriculum's LLM-engineering phase; 2025–26 changes (agentic retrieval) are absorbed by the agentic phase. **Long-context research** beyond RoPE scaling — folded into the architecture week. **Synthetic data & on-device** — folded into the small-models week rather than standing alone. **Alignment theory** — only the empirical, reproducible results made the cut. Constraint honored throughout: no big GPU — every build runs on CPU, a free Colab T4, or is a code-reading of a runnable repo.

---

## 2. Proposed weeks

### Week 1 — Reasoning Models & Test-Time Compute
**Goal:** Understand *why* thinking-token scaling works and implement the classic test-time compute strategies yourself.

**why:** The single biggest capability shift since the transformer itself: models now trade inference tokens for accuracy. Everything downstream — agent budgets, serving costs, eval design — depends on understanding this curve. You already know RLHF; this week reframes it around *verifiable* reward and inference-time search.

**remember:**
- Test-time compute is a third scaling axis alongside parameters and data; best-of-N, self-consistency, and budget forcing are its simplest levers.
- R1's core result: reasoning emerges from RL on verifiable rewards alone — no process supervision needed.

**steps:**
1. **watch** — Denny Zhou, *LLM Reasoning* (Berkeley LLM Agents MOOC) — https://www.youtube.com/watch?v=QL-FS_Zcmyo — 70 min
2. **paper** — *Scaling LLM Test-Time Compute Optimally…* — https://arxiv.org/abs/2408.03314 — 45 min (main body)
3. **paper** — *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via RL* — https://arxiv.org/abs/2501.12948 — ~22 pp, 90 min
4. **build** — Implement best-of-N sampling + majority-vote self-consistency over a small local model (llama.cpp/Ollama, 0.5–3B) on GSM8K-style problems; plot accuracy vs. N — 180 min
5. **build** — Implement s1-style **budget forcing** (append "Wait" to extend thinking; truncate to cap it) and measure the accuracy/token curve — https://github.com/simplescaling/s1 — 120 min
6. **checkpoint** — One-page note: where does your accuracy-vs-compute curve flatten, and why? — 30 min

**Papers:** [Scaling Test-Time Compute Optimally](https://arxiv.org/abs/2408.03314) (~35 pp, read main 45 min) · [DeepSeek-R1](https://arxiv.org/abs/2501.12948) (~22 pp, 90 min) · [s1: Simple test-time scaling](https://arxiv.org/abs/2501.19393) (main ~10 pp, 45 min)

**Total ≈ 9.9 h**

---

### Week 2 — RLVR & GRPO Hands-On
**Goal:** Train a small model with GRPO on a verifiable task and understand the algorithm at the loss-function level.

**why:** GRPO/RLVR is how every 2025–26 reasoning model was made, and unlike PPO-era RLHF it is simple enough to fit in your head: sample a group, score with a verifier, advantage = group-relative reward. Doing it once, even at 0.5B scale on a free Colab, demystifies the entire post-training industry.

**remember:**
- GRPO deletes the critic: the baseline is the mean reward of a group of samples for the same prompt.
- The reward must be *verifiable* (exact match, unit tests, format checks) — reward hacking is the failure mode to watch.

**steps:**
1. **read** — HF LLM Course ch. 12, *Implementing GRPO in TRL* — https://huggingface.co/learn/llm-course/en/chapter12/4 — 60 min
2. **read** — *Mini-R1: reproduce the DeepSeek "aha moment"* (Countdown game) — https://huggingface.co/blog/open-r1/mini-r1-contdown-game — 45 min
3. **build** — Write the GRPO advantage + loss in plain PyTorch on a toy task (your nanoGPT-scale model, CPU) before touching any library — 150 min
4. **build** — Run the HF cookbook GRPO recipe on a free Colab T4 with a small Qwen model; write 2–3 reward functions (format + correctness) — https://huggingface.co/learn/cookbook/en/fine_tuning_llm_grpo_trl — 180 min
5. **build** — Deliberately induce reward hacking (e.g. reward answer-tag presence only), observe it, then patch the reward — 60 min
6. **checkpoint** — Note: GRPO vs PPO vs DPO — when each, in your own words — 30 min

**Papers:** [DeepSeekMath (GRPO §4)](https://arxiv.org/abs/2402.03300) (read §4 + appendix, 60 min) · re-read R1's training pipeline section (30 min)

**Total ≈ 10.2 h**

---

### Week 3 — Inference Optimization & Serving From Scratch
**Goal:** Build KV-caching, quantization, and speculative decoding into your own GPT, and understand how vLLM serves at scale.

**why:** Inference is where AI meets economics, and it's the most CPU-friendly systems topic on the frontier: every technique here is implementable in your from-scratch stack. As an auditor you'll also meet these systems as attack surface (shared KV caches, batch side channels).

**remember:**
- The KV cache *is* the serving problem: PagedAttention is just virtual memory for it.
- Speculative decoding is lossless: draft cheap, verify exact — acceptance rate determines speedup.

**steps:**
1. **build** — Add a KV cache to your from-scratch GPT (from the earlier phases); measure tokens/sec before/after on CPU — 150 min
2. **paper** — *Efficient Memory Management for LLM Serving with PagedAttention* (vLLM) — https://arxiv.org/abs/2309.06180 — ~18 pp, 75 min
3. **paper** — *Fast Inference from Transformers via Speculative Decoding* — https://arxiv.org/abs/2211.17192 — ~11 pp, 60 min
4. **build** — Implement speculative decoding with GPT-2-small drafting for GPT-2-medium (CPU, HF transformers); measure acceptance rate and speedup — 180 min
5. **build** — Quantize a small model with llama.cpp at Q8/Q4/Q2; benchmark perplexity + speed per level; skim vLLM docs to map what you built to production features — https://docs.vllm.ai/en/latest/ — 120 min
6. **read** — GPTQ vs AWQ: skim both abstracts + method sections — https://arxiv.org/abs/2210.17323 · https://arxiv.org/abs/2306.00978 — 60 min
7. **checkpoint** — Table: technique → what it saves (memory/latency/throughput) → what it costs — 30 min

**Papers:** [PagedAttention/vLLM](https://arxiv.org/abs/2309.06180) (18 pp, 75 min) · [Speculative Decoding](https://arxiv.org/abs/2211.17192) (11 pp, 60 min) · [GPTQ](https://arxiv.org/abs/2210.17323) / [AWQ](https://arxiv.org/abs/2306.00978) (skim, 60 min)

**Total ≈ 11.3 h**

---

### Week 4 — The Architectures That Won: MoE & Long Context
**Goal:** Build a mixture-of-experts layer into your nanoGPT and understand why sparse + long-context is the 2026 consensus.

**why:** Every frontier model of 2025–26 (DeepSeek-V3, Mixtral lineage, and closed peers) is a sparse MoE with an engineered long context. The core mechanism — a router picking top-k expert FFNs — is a one-evening build at char-LM scale, and the failure mode (expert collapse) is instructive to see live.

**remember:**
- MoE decouples parameter count from FLOPs per token: top-2 of 8 experts ≈ 13B active in a 47B model (Mixtral).
- Load-balancing losses aren't optional — without them the router collapses onto few experts.

**steps:**
1. **read** — Cameron Wolfe, *Mixture-of-Experts LLMs* (deep explainer) — https://cameronrwolfe.substack.com/p/moe-llms — 90 min
2. **paper** — *Mixtral of Experts* — https://arxiv.org/pdf/2401.04088 — ~13 pp, 60 min
3. **build** — Replace the FFN in your nanoGPT with a top-2-of-8 MoE layer + load-balancing loss; train on CPU at char scale; plot per-expert utilization with and without the balancing loss — 240 min
4. **paper** — *DeepSeek-V3 Technical Report* — https://arxiv.org/abs/2412.19437 — read §architecture only (MLA, fine-grained experts, aux-loss-free balancing), 75 min
5. **read** — RoPE scaling / long-context section of the vLLM or HF docs encountered in Week 3; note how context extension actually ships — 45 min
6. **checkpoint** — Note: what did your router learn? Which tokens go where? — 30 min

**Papers:** [Mixtral of Experts](https://arxiv.org/pdf/2401.04088) (13 pp, 60 min) · [DeepSeek-V3](https://arxiv.org/abs/2412.19437) (read arch §, 75 min)

**Total ≈ 9 h**

---

### Week 5 — Small Models, Distillation & Synthetic Data: nanochat End-to-End
**Goal:** Read Karpathy's nanochat cover-to-cover and run a distillation experiment of your own.

**why:** nanochat (Oct 2025) is the best single artifact tying your whole curriculum together: tokenizer → pretraining → SFT → RL → inference → web UI in ~8,000 lines. R1's distilled models proved the second big 2025 lesson: reasoning transfers to small models via synthetic traces. Small/on-device models are where a no-GPU practitioner has real leverage.

**remember:**
- Distillation from a strong reasoner beats RL directly on a small model (R1's distillation result).
- The full LLM pipeline fits in 8K lines — there is no magic left between you and production.

**steps:**
1. **read** — nanochat announcement + walkthrough discussion — https://github.com/karpathy/nanochat/discussions/1 — 45 min
2. **build (code-reading)** — Read the nanochat repo end-to-end, one subsystem per sitting (tokenizer, pretrain, SFT, RL, inference engine); annotate how its inference engine uses the Week-3 techniques — https://github.com/karpathy/nanochat — 240 min
3. **read** — Simon Willison's nanochat notes (what runs where, incl. CPU inference of shared checkpoints) — https://simonwillison.net/2025/Oct/13/nanochat/ — 20 min
4. **build** — Distillation experiment on free Colab: generate ~500 reasoning traces for a narrow task from a strong free-tier API model, SFT a small open model on them, evaluate before/after — 180 min
5. **read** — R1 paper's distillation section (re-read with fresh eyes) — 30 min
6. **checkpoint** — Note: your distilled model's wins and failure cases; what synthetic-data filtering would fix — 30 min

**Papers:** re-read [DeepSeek-R1 §distillation](https://arxiv.org/abs/2501.12948) (30 min) — light paper week by design; the repo is the text.

**Total ≈ 9.1 h**

---

### Week 6 — Mechanistic Interpretability: Opening the Black Box
**Goal:** Use TransformerLens to find real circuits in GPT-2, and understand SAEs and attribution graphs.

**why:** Interp went from academic to applied in 2024–26: sparse autoencoders extract human-legible features from production models, and attribution graphs trace *why* a model answered. For a security auditor this is the most natural specialization on the frontier — interpretability is auditing, done on weights instead of code. GPT-2-small on CPU is fully sufficient.

**remember:**
- Induction heads are the "hello world" of interp: a two-head circuit implementing in-context copying.
- SAE features are a *lens*, not ground truth — polysemanticity and superposition are why raw neurons don't work.

**steps:**
1. **read** — Neel Nanda, *Mechanistic Interpretability Quickstart Guide* — https://www.neelnanda.io/mechanistic-interpretability/quickstart-old — 45 min
2. **build** — ARENA Ch. 1 interp exercises: TransformerLens on GPT-2-small — find induction heads, verify with ablation — https://www.arena.education/chapter1 — 240 min
3. **paper** — *In-context Learning and Induction Heads* — https://arxiv.org/pdf/2209.11895 — read main narrative, 75 min
4. **read** — *Scaling Monosemanticity* (SAE features in Claude 3 Sonnet) — https://transformer-circuits.pub/2024/scaling-monosemanticity/ — read intro + feature-tour + safety-relevant features, 90 min
5. **read** — *On the Biology of a Large Language Model* (attribution graphs; skim the planning-in-poetry and refusal case studies) — https://transformer-circuits.pub/2025/attribution-graphs/biology.html — 90 min
6. **build** — Activation-patching mini-experiment: localize where a fact lives in GPT-2 (e.g. "The Eiffel Tower is in ___") — 90 min
7. **checkpoint** — Note: how would you use SAE features in a model audit? — 30 min

**Papers:** [Induction Heads](https://arxiv.org/pdf/2209.11895) (75 min) · Scaling Monosemanticity + Biology of an LLM (web-native, 180 min combined)

**Total ≈ 11 h**

---

### Week 7 — Empirical Safety: Alignment Faking, Emergent Misalignment & the Audit Mindset
**Goal:** Read the two landmark empirical safety results of 2024–25 and design a model audit protocol as a security professional.

**why:** Two experiments changed the safety conversation from philosophy to evidence: Claude 3 Opus strategically faking alignment under training pressure, and narrow insecure-code finetuning producing *broad* misalignment. These are directly legible to an auditor's threat-model instincts, and connect forward to the agentic phase's red-teaming week.

**remember:**
- Alignment faking: a model can comply *during training* specifically to preserve its behavior *outside* training — evals that the model can detect are compromised evals.
- Emergent misalignment: a narrow bad finetune generalizes to broad badness — provenance of finetuning data is a supply-chain security problem.

**steps:**
1. **paper** — *Alignment Faking in Large Language Models* — https://arxiv.org/abs/2412.14093 — read main body + reviewer discussion on the companion post https://www.alignmentforum.org/posts/njAZwT8nkHnjipJku/alignment-faking-in-large-language-models — 120 min
2. **paper** — *Emergent Misalignment: Narrow finetuning can produce broadly misaligned LLMs* — https://arxiv.org/html/2502.17424v3 — main ~10 pp, 60 min
3. **build** — Small-scale replication probe: finetune a small open model (Colab) on a narrow "bad advice" dataset you synthesize; measure drift on unrelated questions before/after — 180 min
4. **build** — Write a **model audit protocol** (your profession, applied): threat model, eval-awareness risks, finetuning supply chain, interp spot-checks from Week 6, behavioral batteries — 120 min
5. **read** — Skim one 2026 follow-up thread via the Alignment Forum post's citations to see where the debate stands — 45 min
6. **checkpoint** — One page: "What would it take to convince me this model is safe to deploy?" — 30 min

**Papers:** [Alignment Faking](https://arxiv.org/abs/2412.14093) (main ~20 pp of ~137, 120 min) · [Emergent Misalignment](https://arxiv.org/html/2502.17424v3) (10 pp, 60 min)

**Total ≈ 9.3 h**

---

### Week 8 — Frontier Survey + Capstone: The Tiny Frontier Stack
**Goal:** Survey what was deliberately left out, then compose Weeks 1–7 into one end-to-end artifact.

**why:** A serious engineer needs a map of the excluded territory (diffusion LMs, world models, VLAs) even without deep study. Then the capstone: train, serve, inspect, and audit one small model — the entire 2026 stack, at a scale you own completely.

**remember:**
- You can now take a model from random weights → RLVR-trained reasoner → quantized served endpoint → interp-audited artifact, alone, on modest hardware.
- Frontier literacy = knowing what you *chose* not to specialize in, and why.

**steps:**
1. **paper** — *Large Language Diffusion Models* (LLaDA) — https://arxiv.org/abs/2502.09992 — ~20 pp, read main, 75 min; demo: https://ml-gsai.github.io/LLaDA-demo/ — 15 min
2. **read** — Skim the diffusion-LM survey repo index to map the subfield — https://github.com/VILA-Lab/Awesome-DLMs — 30 min
3. **note** — 30-minute written map of world models / video gen / VLA: what they are, why excluded, what would trigger revisiting — 30 min
4. **build (capstone)** — **Tiny Frontier Stack**: (a) small model + GRPO on a verifiable task (Week 2 recipe); (b) serve it with your KV-cache + quantized + speculative-decoding inference path (Week 3); (c) run an interp spot-check on one behavior (Week 6); (d) run your audit protocol against it (Week 7); (e) publish a model card + audit report in your tracker repo — 420 min
5. **checkpoint** — Retrospective: which week changed how you'll work? Feed conclusions into the agentic phase — 30 min

**Papers:** [LLaDA](https://arxiv.org/abs/2502.09992) (75 min)

**Total ≈ 10 h**

---

## 3. Top 10 papers for the phase, ranked

1. **[DeepSeek-R1](https://arxiv.org/abs/2501.12948)** — the paper of the era: RLVR alone elicits reasoning, and distillation transfers it; anchors Weeks 1, 2, and 5.
2. **[DeepSeekMath / GRPO](https://arxiv.org/abs/2402.03300)** — the algorithm everyone actually uses; §4 is the most-implemented method section of 2025.
3. **[Scaling LLM Test-Time Compute Optimally](https://arxiv.org/abs/2408.03314)** — established test-time compute as a scaling axis before o1 made it obvious.
4. **[Alignment Faking in LLMs](https://arxiv.org/abs/2412.14093)** — the landmark empirical safety result; changes how you design evals forever.
5. **[vLLM / PagedAttention](https://arxiv.org/abs/2309.06180)** — the systems paper underlying essentially all open-model serving.
6. **[s1: Simple test-time scaling](https://arxiv.org/abs/2501.19393)** — 1K samples + "Wait" = reasoning; the best minimal-recipe paper to reproduce.
7. **[In-context Learning and Induction Heads](https://arxiv.org/pdf/2209.11895)** — the canonical worked example of a real circuit; the gateway to interp.
8. **[Emergent Misalignment](https://arxiv.org/html/2502.17424v3)** — narrow finetune, broad misalignment; a supply-chain security result wearing a safety costume.
9. **[Mixtral of Experts](https://arxiv.org/pdf/2401.04088)** — the clearest published account of the architecture pattern that won.
10. **[Fast Inference via Speculative Decoding](https://arxiv.org/abs/2211.17192)** — elegant, lossless, buildable in an afternoon; the ideal paper-to-code exercise.

(Web-native honorable mentions, unranked because not arXiv: [Scaling Monosemanticity](https://transformer-circuits.pub/2024/scaling-monosemanticity/) and [On the Biology of a Large Language Model](https://transformer-circuits.pub/2025/attribution-graphs/biology.html) — both essential Week 6 reading.)

## 4. Sources consulted

- https://arxiv.org/abs/2501.12948 · https://arxiv.org/abs/2501.19393 · https://github.com/simplescaling/s1 · https://arxiv.org/abs/2408.03314 · https://arxiv.org/abs/2402.03300
- https://huggingface.co/learn/llm-course/en/chapter12/4 · https://huggingface.co/blog/open-r1/mini-r1-contdown-game · https://huggingface.co/learn/cookbook/en/fine_tuning_llm_grpo_trl · https://huggingface.co/docs/trl/en/community_tutorials
- https://docs.vllm.ai/en/latest/ · https://arxiv.org/abs/2309.06180 · https://arxiv.org/abs/2211.17192 · https://arxiv.org/abs/2210.17323 · https://arxiv.org/abs/2306.00978
- https://arxiv.org/pdf/2401.04088 · https://arxiv.org/abs/2412.19437 · https://cameronrwolfe.substack.com/p/moe-llms
- https://github.com/karpathy/nanochat · https://github.com/karpathy/nanochat/discussions/1 · https://simonwillison.net/2025/Oct/13/nanochat/
- https://www.arena.education/chapter1 · https://www.neelnanda.io/mechanistic-interpretability/quickstart-old · https://arxiv.org/pdf/2209.11895 · https://transformer-circuits.pub/2024/scaling-monosemanticity/ · https://transformer-circuits.pub/2025/attribution-graphs/biology.html
- https://arxiv.org/abs/2412.14093 · https://www.alignmentforum.org/posts/njAZwT8nkHnjipJku/alignment-faking-in-large-language-models · https://arxiv.org/html/2502.17424v3
- https://arxiv.org/abs/2502.09992 · https://ml-gsai.github.io/LLaDA-demo/ · https://github.com/VILA-Lab/Awesome-DLMs
- https://www.youtube.com/watch?v=QL-FS_Zcmyo (Berkeley LLM Agents MOOC, Denny Zhou) · https://rdi.berkeley.edu/agentic-ai/f25
- Discovery-pass sources that informed exclusions: https://arxiv.org/pdf/2509.02547 (agentic RL survey) · https://arxiv.org/abs/2503.16416 (agent eval survey) · vLLM docs quantization/spec-decode pages · MoE-Mamba https://arxiv.org/html/2401.04081 · LLaDA-V https://arxiv.org/abs/2505.16933 · world-models/VLA and browser/computer-use landscape searches (OSWorld state-of-the-art coverage) used to justify exclusion.
