// Generates seed/seed.sql from the curriculum's progress.json (single source of truth)
// plus a curated set of per-phase resources (courses, papers, embeddable YouTube).
//
//   node seed/generate-seed.mjs
//
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const progress = JSON.parse(readFileSync(join(here, "..", "..", "progress.json"), "utf8"));

const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";

function kindOf(id) {
  if (id.startsWith("week")) return "week";
  if (id.startsWith("portfolio")) return "portfolio";
  if (id === "advanced") return "advanced";
  return "research";
}
function weekIndexOf(id) {
  const m = /^week(\d+)$/.exec(id);
  return m ? parseInt(m[1], 10) : null;
}

// --- curated resources, keyed by the exact phase label used in progress.json ---
// kind 'youtube' must be an embeddable watch?v= or playlist?list= URL.
const RES = {
  "Phase 0 — Setup": [
    ["3Blue1Brown — Essence of Linear Algebra", "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", "youtube"],
    ["Karpathy — Neural Networks: Zero to Hero", "https://karpathy.ai/zero-to-hero.html", "course"],
  ],
  "Phase 1 — Math": [
    ["3B1B — Essence of Linear Algebra", "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", "youtube"],
    ["3B1B — Essence of Calculus", "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr", "youtube"],
    ["MIT 18.06 — Linear Algebra (Strang)", "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", "course"],
    ["Mathematics for Machine Learning (free book)", "https://mml-book.github.io/", "paper"],
    ["Harvard Stat 110 (Blitzstein)", "https://projects.iq.harvard.edu/stat110", "course"],
  ],
  "Phase 2 — Classical ML": [
    ["Stanford CS229 — Machine Learning", "https://cs229.stanford.edu/", "course"],
    ["Intro to Statistical Learning (ISLR)", "https://www.statlearning.com/", "course"],
    ["Berkeley CS188 — Intro to AI", "https://inst.eecs.berkeley.edu/~cs188/", "course"],
    ["Google ML Crash Course", "https://developers.google.com/machine-learning/crash-course", "course"],
  ],
  "Phase 3 — Neural Nets": [
    ["Karpathy — Neural Networks: Zero to Hero", "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ", "youtube"],
    ["3B1B — Neural Networks", "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", "youtube"],
    ["nn-zero-to-hero (code)", "https://github.com/karpathy/nn-zero-to-hero", "link"],
    ["fast.ai — Practical Deep Learning", "https://course.fast.ai/", "course"],
    ["Dive into Deep Learning (d2l.ai)", "https://d2l.ai/", "course"],
  ],
  "Phase 4 — Deep Learning": [
    ["Stanford CS231n — CNNs for Vision", "https://cs231n.stanford.edu/", "course"],
    ["Stanford CS224N — NLP with Deep Learning", "https://web.stanford.edu/class/cs224n/", "course"],
    ["Hugging Face — NLP Course", "https://huggingface.co/learn/nlp-course", "course"],
  ],
  "Phase 5 — Transformers": [
    ["Stanford CS336 — Language Modeling from Scratch", "https://stanford-cs336.github.io/", "course"],
    ["Karpathy — Let's build GPT", "https://www.youtube.com/watch?v=kCc8FmEb1nY", "youtube"],
    ["Attention Is All You Need", "https://arxiv.org/abs/1706.03762", "paper"],
    ["The Illustrated Transformer", "https://jalammar.github.io/illustrated-transformer/", "link"],
    ["Lilian Weng's blog", "https://lilianweng.github.io/", "link"],
  ],
  "Phase 6 — LLM Engineering": [
    ["Full Stack Deep Learning — LLM Bootcamp", "https://fullstackdeeplearning.com/llm-bootcamp/", "course"],
    ["DataTalksClub — LLM Zoomcamp", "https://github.com/DataTalksClub/llm-zoomcamp", "course"],
    ["vLLM documentation", "https://docs.vllm.ai/", "link"],
    ["Hugging Face — LLM Course", "https://huggingface.co/learn/llm-course", "course"],
  ],
  "Phase 7 — RLHF": [
    ["OpenAI — Spinning Up in Deep RL", "https://spinningup.openai.com/", "course"],
    ["Hugging Face — Deep RL Course", "https://huggingface.co/learn/deep-rl-course", "course"],
    ["Berkeley CS285 — Deep RL", "https://rail.eecs.berkeley.edu/deeprlcourse/", "course"],
    ["InstructGPT (Ouyang et al. 2022)", "https://arxiv.org/abs/2203.02155", "paper"],
    ["DPO (Rafailov et al. 2023)", "https://arxiv.org/abs/2305.18290", "paper"],
  ],
  "Phase 8 — Agents": [
    ["Anthropic — Building Effective Agents", "https://www.anthropic.com/research/building-effective-agents", "link"],
    ["Hugging Face — Agents Course", "https://huggingface.co/learn/agents-course", "course"],
    ["Hugging Face — MCP Course", "https://huggingface.co/learn/mcp-course", "course"],
    ["Berkeley — LLM Agents", "https://rdi.berkeley.edu/llm-agents/", "course"],
  ],
  "Phase 9 — Research": [
    ["Hugging Face — Daily Papers", "https://huggingface.co/papers", "link"],
    ["arXiv cs.LG (recent)", "https://arxiv.org/list/cs.LG/recent", "link"],
    ["Papers with Code", "https://paperswithcode.com/", "link"],
    ["Distill.pub", "https://distill.pub/", "link"],
    ["Anthropic — Transformer Circuits", "https://transformer-circuits.pub/", "link"],
  ],
  "Phase 10 — Advanced": [
    ["NVIDIA CUDA C++ Programming Guide", "https://docs.nvidia.com/cuda/cuda-c-programming-guide/", "link"],
    ["Microsoft DeepSpeed", "https://www.deepspeed.ai/", "link"],
    ["Anthropic — Transformer Circuits", "https://transformer-circuits.pub/", "link"],
  ],
};

const lines = [];
lines.push("-- GENERATED by seed/generate-seed.mjs — do not edit by hand.");
lines.push("DELETE FROM milestones; DELETE FROM resources; DELETE FROM settings;");
lines.push("");

// milestones
progress.forEach((m, i) => {
  const wi = weekIndexOf(m.id);
  lines.push(
    `INSERT INTO milestones (id, phase, title, kind, week_index, sort, done, done_at) VALUES (` +
      `${q(m.id)}, ${q(m.phase)}, ${q(m.title)}, ${q(kindOf(m.id))}, ` +
      `${wi === null ? "NULL" : wi}, ${i}, ${m.done ? 1 : 0}, NULL);`
  );
});
lines.push("");

// resources
let rsort = 0;
for (const [phase, items] of Object.entries(RES)) {
  for (const [title, url, kind] of items) {
    lines.push(
      `INSERT INTO resources (scope, ref, title, url, kind, pinned, sort) VALUES (` +
        `'phase', ${q(phase)}, ${q(title)}, ${q(url)}, ${q(kind)}, 0, ${rsort++});`
    );
  }
}
lines.push("");

// settings (start tomorrow, 1 week per slot, 1 buffer week per phase)
const settings = {
  start_date: "2026-07-08",
  pace_weeks_per_slot: "1",
  buffer_per_phase: "1",
  reminder_email: "mrimamss@gmail.com",
  reminder_enabled: "1",
  timezone: "UTC",
};
for (const [k, v] of Object.entries(settings)) {
  lines.push(`INSERT INTO settings (key, value) VALUES (${q(k)}, ${q(v)});`);
}
lines.push("");

writeFileSync(join(here, "seed.sql"), lines.join("\n"));
console.log(`Wrote seed/seed.sql: ${progress.length} milestones, ${rsort} resources.`);
