// Single source of truth for the curriculum, as an ordered list of concrete STEPS.
// A step is one atomic action with an HONEST time estimate and (optionally) a link.
// Time philosophy: a "watch" step is video runtime + pause/rewind/note-taking —
// for dense math (3B1B) that's roughly 2× the raw runtime. Weeks 0–8 are authored
// in detail; later weeks carry an honest lecture-time estimate to refine on arrival.
// Sessions are NOT fixed here — plan.ts rolls the next ~sitting's worth of steps.

export type Kind = "setup" | "watch" | "read" | "build" | "exercise" | "checkpoint" | "note" | "paper" | "project";

export interface StepDef {
  title: string;
  kind: Kind;
  minutes: number;
  url?: string;
}
export interface WeekDef {
  id: string;
  phase: string;
  title: string;
  steps: StepDef[];
}

// --- resource links ---------------------------------------------------------
const EOLA = "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab"; // Essence of Linear Algebra
const EOCALC = "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr"; // Essence of Calculus
const NNCALC = "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"; // 3B1B Neural Networks
const KARPATHY = "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ"; // Zero to Hero
const STATQUEST = "https://www.youtube.com/@statquest/playlists";

// --- Phase 0 & 1: authored in detail ---------------------------------------
const DETAILED: WeekDef[] = [
  {
    id: "week00",
    phase: "Phase 0 — Setup",
    title: "Setup — environment & habits",
    steps: [
      { title: "Run `bash setup.sh` (installs the toolchain)", kind: "setup", minutes: 10 },
      { title: "Verify: `uv run python -c \"import numpy, matplotlib\"`", kind: "setup", minutes: 5 },
      { title: "Launch `uv run jupyter lab` once, then close it", kind: "setup", minutes: 5 },
      { title: "Read phase0-setup/README.md", kind: "read", minutes: 5 },
      { title: "Write your first entry in notes/weekly-notes.md", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week01",
    phase: "Phase 1 — Math",
    title: "Vectors, matrices, dot products",
    steps: [
      { title: "Watch + absorb: 3B1B EoLA Ch.1 — Vectors (~10m video)", kind: "watch", minutes: 20, url: EOLA },
      { title: "Watch + absorb: 3B1B EoLA Ch.2 — Span & basis (~10m video)", kind: "watch", minutes: 20, url: EOLA },
      { title: "Watch + absorb: 3B1B EoLA Ch.3 — Linear transformations (~11m video)", kind: "watch", minutes: 25, url: EOLA },
      { title: "Watch + absorb: 3B1B EoLA Ch.4 — Matrix multiplication (~10m video)", kind: "watch", minutes: 20, url: EOLA },
      { title: "Read week01 README (matrix_multiply brief)", kind: "read", minutes: 5 },
      { title: "Build: implement dot() + run its test to green", kind: "build", minutes: 30 },
      { title: "Build: implement transpose()", kind: "build", minutes: 20 },
      { title: "Build: implement matmul() → pass all tests", kind: "build", minutes: 40 },
      { title: "Checkpoint: explain matrix multiplication out loud, no notes", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + `git commit`", kind: "note", minutes: 15 },
    ],
  },
  {
    id: "week02",
    phase: "Phase 1 — Math",
    title: "Linear transformations & basis",
    steps: [
      { title: "Watch + absorb: 3B1B EoLA Ch.5 (determinant) + Ch.13 (change of basis)", kind: "watch", minutes: 45, url: EOLA },
      { title: "Re-watch Ch.3–4 only if transformations still feel fuzzy", kind: "watch", minutes: 20, url: EOLA },
      { title: "Read week02 README (vector_viz brief)", kind: "read", minutes: 5 },
      { title: "Build: implement apply_transform() in vector_viz.py", kind: "build", minutes: 30 },
      { title: "Build: plot a rotation, a shear, and a scaling; save the images", kind: "build", minutes: 40 },
      { title: "Checkpoint: predict where î and ĵ land for a given 2×2 matrix", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week03",
    phase: "Phase 1 — Math",
    title: "Eigenvalues, eigenvectors, SVD intuition",
    steps: [
      { title: "Watch + absorb: 3B1B EoLA Ch.14 — Eigenvectors & eigenvalues (~17m video)", kind: "watch", minutes: 35, url: EOLA },
      { title: "Read week03 README (PCA intuition brief)", kind: "read", minutes: 5 },
      { title: "Build: PCA-intuition notebook — covariance → eig → plot eigenvectors on data", kind: "build", minutes: 90 },
      { title: "Checkpoint: explain what an eigenvector actually is", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week04",
    phase: "Phase 1 — Math",
    title: "Derivatives & gradients",
    steps: [
      { title: "Watch + absorb: 3B1B Essence of Calculus Ch.1 (~17m video)", kind: "watch", minutes: 30, url: EOCALC },
      { title: "Watch + absorb: 3B1B EoCalc Ch.2–3 — derivatives (~2×15m video)", kind: "watch", minutes: 55, url: EOCALC },
      { title: "Read week04 README (gradient-descent brief)", kind: "read", minutes: 5 },
      { title: "Build: gradient-descent visualization on f(x)=x² and a 2D bowl", kind: "build", minutes: 75 },
      { title: "Checkpoint: derive the GD update rule; explain the learning rate", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week05",
    phase: "Phase 1 — Math",
    title: "Partial derivatives & the chain rule",
    steps: [
      { title: "Watch + absorb: 3B1B EoCalc — chain/product rule (~16m video)", kind: "watch", minutes: 30, url: EOCALC },
      { title: "Watch + absorb: 3B1B Neural Networks Ch.3–4 — backprop calculus (~2×15m)", kind: "watch", minutes: 55, url: NNCALC },
      { title: "Build: manual-backprop notebook — hand-derive, then finite-difference check", kind: "build", minutes: 90 },
      { title: "Checkpoint: hand-derive backprop for a 2-layer net", kind: "checkpoint", minutes: 15 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week06",
    phase: "Phase 1 — Math",
    title: "Probability & Bayes",
    steps: [
      { title: "Watch + absorb: StatQuest — probability & Bayes basics (~4 videos)", kind: "watch", minutes: 60, url: STATQUEST },
      { title: "Read week06 README (coin_flips brief)", kind: "read", minutes: 5 },
      { title: "Build: implement coin_flips.py + pass tests", kind: "build", minutes: 45 },
      { title: "Build: plot running_estimates — watch it converge (law of large numbers)", kind: "build", minutes: 25 },
      { title: "Checkpoint: state Bayes' theorem and work the false-positive example", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week07",
    phase: "Phase 1 — Math",
    title: "Distributions, expectation, variance, entropy",
    steps: [
      { title: "Watch + absorb: StatQuest — distributions, expectation, variance (~4 videos)", kind: "watch", minutes: 65, url: STATQUEST },
      { title: "Read week07 README (distribution visualizer brief)", kind: "read", minutes: 5 },
      { title: "Build: distribution visualizer — sample, histogram, overlay theory", kind: "build", minutes: 70 },
      { title: "Checkpoint: compute E[X], Var[X]; explain entropy in one sentence", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week08",
    phase: "Phase 1 — Math",
    title: "Capstone — Linear & Logistic Regression (NumPy only)",
    steps: [
      { title: "Read week08 README (capstone brief)", kind: "read", minutes: 10 },
      { title: "Build: mse() + LinearRegression.fit/predict → pass tests", kind: "build", minutes: 90 },
      { title: "Build: sigmoid() + LogisticRegression → pass tests", kind: "build", minutes: 90 },
      { title: "Checkpoint: explain MSE vs log-loss and their gradients", kind: "checkpoint", minutes: 15 },
      { title: "Write your note, commit, and mark portfolio project #2 done", kind: "note", minutes: 15 },
    ],
  },
];

// --- Phases 2–10: compact spec, auto-expanded until you reach them ----------
const PHASE_PRIMARY: Record<string, string> = {
  "Phase 2 — Classical ML": "https://cs229.stanford.edu/",
  "Phase 3 — Neural Nets": KARPATHY,
  "Phase 4 — Deep Learning": "https://cs231n.stanford.edu/",
  "Phase 5 — Transformers": "https://stanford-cs336.github.io/",
  "Phase 6 — LLM Engineering": "https://huggingface.co/learn/llm-course",
  "Phase 7 — RLHF": "https://huggingface.co/learn/deep-rl-course",
  "Phase 8 — Agents": "https://www.anthropic.com/research/building-effective-agents",
  "Phase 9 — Research": "https://huggingface.co/papers",
  "Phase 10 — Advanced": "https://transformer-circuits.pub/",
  Portfolio: "",
};

// (id, phase, title) for everything after week 8.
const REST: [string, string, string][] = [
  ["week09", "Phase 2 — Classical ML", "Linear regression from scratch"],
  ["week10", "Phase 2 — Classical ML", "Logistic regression from scratch"],
  ["week11", "Phase 2 — Classical ML", "Decision trees from scratch"],
  ["week12", "Phase 2 — Classical ML", "Random forests"],
  ["week13", "Phase 2 — Classical ML", "K-means from scratch"],
  ["week14", "Phase 2 — Classical ML", "PCA from scratch"],
  ["week15", "Phase 2 — Classical ML", "Classical AI: search & A*"],
  ["week16", "Phase 2 — Classical ML", "Capstone: ML Playground"],
  ["week17", "Phase 3 — Neural Nets", "micrograd part 1 — the Value class"],
  ["week18", "Phase 3 — Neural Nets", "Autograd engine (backward pass)"],
  ["week19", "Phase 3 — Neural Nets", "Backpropagation (topological sort)"],
  ["week20", "Phase 3 — Neural Nets", "MLP on top of Value"],
  ["week21", "Phase 3 — Neural Nets", "Train a character classifier"],
  ["week22", "Phase 3 — Neural Nets", "Optimization (SGD/Momentum/Adam) + PyTorch intro"],
  ["week23", "Phase 3 — Neural Nets", "Activation functions"],
  ["week24", "Phase 3 — Neural Nets", "Regularization (dropout, batchnorm)"],
  ["week25", "Phase 3 — Neural Nets", "makemore (part 1)"],
  ["week26", "Phase 3 — Neural Nets", "makemore (part 2)"],
  ["week27", "Phase 3 — Neural Nets", "Capstone: Tiny NN framework (part 1)"],
  ["week28", "Phase 3 — Neural Nets", "Capstone: Tiny NN framework (part 2)"],
  ["week29", "Phase 4 — Deep Learning", "CNNs — image classifier"],
  ["week30", "Phase 4 — Deep Learning", "Convolutions from scratch"],
  ["week31", "Phase 4 — Deep Learning", "RNNs"],
  ["week32", "Phase 4 — Deep Learning", "LSTMs"],
  ["week33", "Phase 4 — Deep Learning", "Word embeddings + t-SNE/UMAP"],
  ["week34", "Phase 4 — Deep Learning", "Sequence modeling (seq2seq)"],
  ["week35", "Phase 4 — Deep Learning", "Attention mechanism from scratch"],
  ["week36", "Phase 4 — Deep Learning", "Capstone: sentiment classifier"],
  ["week37", "Phase 5 — Transformers", "Read 'Attention Is All You Need' + summary"],
  ["week38", "Phase 5 — Transformers", "Scaled dot-product attention"],
  ["week39", "Phase 5 — Transformers", "Multi-head attention"],
  ["week40", "Phase 5 — Transformers", "Transformer block"],
  ["week41", "Phase 5 — Transformers", "Encoder"],
  ["week42", "Phase 5 — Transformers", "Decoder"],
  ["week43", "Phase 5 — Transformers", "BPE tokenizer from scratch"],
  ["week44", "Phase 5 — Transformers", "Positional embeddings"],
  ["week45", "Phase 5 — Transformers", "Train a mini-transformer"],
  ["week46", "Phase 5 — Transformers", "Train a GPT-like model"],
  ["week47", "Phase 5 — Transformers", "Text generation (sampling)"],
  ["week48", "Phase 5 — Transformers", "Capstone: nanoGPT reproduction"],
  ["week49", "Phase 6 — LLM Engineering", "Embeddings"],
  ["week50", "Phase 6 — LLM Engineering", "Vector databases"],
  ["week51", "Phase 6 — LLM Engineering", "Semantic search"],
  ["week52", "Phase 6 — LLM Engineering", "RAG fundamentals"],
  ["week53", "Phase 6 — LLM Engineering", "Build a simple RAG"],
  ["week54", "Phase 6 — LLM Engineering", "Evaluation"],
  ["week55", "Phase 6 — LLM Engineering", "Fine-tuning"],
  ["week56", "Phase 6 — LLM Engineering", "LoRA"],
  ["week57", "Phase 6 — LLM Engineering", "Quantization"],
  ["week58", "Phase 6 — LLM Engineering", "Inference optimization"],
  ["week59", "Phase 6 — LLM Engineering", "Capstone: Production RAG (part 1)"],
  ["week60", "Phase 6 — LLM Engineering", "Capstone: Production RAG (part 2)"],
  ["week61", "Phase 7 — RLHF", "RL basics"],
  ["week62", "Phase 7 — RLHF", "Q-learning"],
  ["week63", "Phase 7 — RLHF", "Policy gradients (REINFORCE)"],
  ["week64", "Phase 7 — RLHF", "RLHF overview"],
  ["week65", "Phase 7 — RLHF", "Preference datasets"],
  ["week66", "Phase 7 — RLHF", "DPO"],
  ["week67", "Phase 7 — RLHF", "Evaluation frameworks"],
  ["week68", "Phase 7 — RLHF", "Capstone: Toy RLHF pipeline"],
  ["week69", "Phase 8 — Agents", "Raw tool calling (no framework)"],
  ["week70", "Phase 8 — Agents", "Memory systems"],
  ["week71", "Phase 8 — Agents", "Planning loops"],
  ["week72", "Phase 8 — Agents", "Reflection patterns"],
  ["week73", "Phase 8 — Agents", "MCP (Model Context Protocol)"],
  ["week74", "Phase 8 — Agents", "Multi-agent systems"],
  ["week75", "Phase 8 — Agents", "Agent evaluation"],
  ["week76", "Phase 8 — Agents", "Capstone: AI Security Research Agent"],
];

function expand([id, phase, title]: [string, string, string]): WeekDef {
  const url = PHASE_PRIMARY[phase] || undefined;
  return {
    id,
    phase,
    title,
    steps: [
      { title: `Watch the week's lectures — pick the specific videos (time est.)`, kind: "watch", minutes: 180, url },
      { title: `Build: ${title}`, kind: "build", minutes: 150 },
      { title: `Keep building + exercises: ${title}`, kind: "build", minutes: 150 },
      { title: `Checkpoint — confirm you can explain it out loud`, kind: "checkpoint", minutes: 30 },
      { title: `Write your note & commit`, kind: "note", minutes: 30 },
    ],
  };
}

export const WEEKS: WeekDef[] = [...DETAILED, ...REST.map(expand)];
