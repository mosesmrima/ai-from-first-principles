# Phase 7 — RLHF, Post-Training & Evals (Weeks 61–68)

**Goal:** how model behaviour is *shaped*. This is what separates real practitioners from people
who think "ChatGPT" is the whole story.

**Dependencies:** `uv sync --extra rl --extra posttrain`.

## Resources
- OpenAI — Spinning Up in Deep RL
- Hugging Face — Deep RL Course; TRL documentation
- Berkeley CS285 — Deep Reinforcement Learning
- Papers: **InstructGPT** (Ouyang 2022), **DPO** (Rafailov 2023)
- Tim Dettmers' blog (quantization for post-training)

## Weekly plan

| Week | Topics | 🛠 Build |
|---|---|---|
| 61 | RL basics | gridworld agent |
| 62 | Q-learning | tabular Q-learning |
| 63 | policy gradients | REINFORCE |
| 64 | RLHF overview | reward-model sketch |
| 65 | preference datasets | build/curate a preference set |
| 66 | DPO | DPO fine-tune |
| 67 | evaluation frameworks | eval harness for a small model |
| 68 | **Capstone** | **Toy RLHF pipeline** |

## Capstone (Week 68)
A **toy RLHF pipeline**: reward model + PPO loop (and/or a DPO run), with a documented eval suite.
This is the phase that makes the InstructGPT and DPO papers click.
