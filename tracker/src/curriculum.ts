// Single source of truth for the curriculum, as an ordered list of concrete STEPS.
// A step is one atomic action with an HONEST time estimate and (optionally) a link.
// Time philosophy: a "watch" step is video runtime + pause/rewind/note-taking —
// for dense math (3B1B) that's roughly 1.5–2× the raw runtime. URLs below are the
// exact per-video links (verified), not playlists. Weeks 0–8 are authored in detail;
// later weeks carry an honest lecture-time estimate + a key video/paper to refine.

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

// --- exact resource URLs (verified) -----------------------------------------
// 3Blue1Brown — Essence of Linear Algebra
const LA1 = "https://www.youtube.com/watch?v=fNk_zzaMoSs";
const LA2 = "https://www.youtube.com/watch?v=k7RM-ot2NWY";
const LA3 = "https://www.youtube.com/watch?v=kYB8IZa5AuE";
const LA4 = "https://www.youtube.com/watch?v=XkY2DOUCWMU";
const LA5 = "https://www.youtube.com/watch?v=rHLEWRxRGiM";
const LA6 = "https://www.youtube.com/watch?v=Ip3X9LOh2dk";
const LA7 = "https://www.youtube.com/watch?v=uQhTuRlWMxw";
const LA9 = "https://www.youtube.com/watch?v=LyGKycYT2v0";
const LA13 = "https://www.youtube.com/watch?v=P2LTAUO1TdA";
const LA14 = "https://www.youtube.com/watch?v=PFDu9oVAE-g";
// 3Blue1Brown — Essence of Calculus
const CALC1 = "https://www.youtube.com/watch?v=WUvTyaaNkzM";
const CALC2 = "https://www.youtube.com/watch?v=9vKqVkMQHKk";
const CALC3 = "https://www.youtube.com/watch?v=S0_qX4VJhMQ";
const CALC4 = "https://www.youtube.com/watch?v=YG15m2VwSjA";
// 3Blue1Brown — Neural Networks
const NN3 = "https://www.youtube.com/watch?v=Ilg3gGewQ5U";
const NN4 = "https://www.youtube.com/watch?v=tIeHLnjs5U8";
// StatQuest
const SQ_BAYES = "https://www.youtube.com/watch?v=9wCnvr7Xw4E";
const SQ_DIST = "https://www.youtube.com/watch?v=oI3hZJqXJuc";
const SQ_EXP = "https://www.youtube.com/watch?v=KLs_7b7SKi4";
const SQ_VAR = "https://www.youtube.com/watch?v=SzZ6GpcfoQY";
// Karpathy — Neural Networks: Zero to Hero
const K_MICROGRAD = "https://www.youtube.com/watch?v=VMj-3S1tku0";
const K_MAKEMORE1 = "https://www.youtube.com/watch?v=PaCmpygFfXo";
const K_MAKEMORE2 = "https://www.youtube.com/watch?v=TCH_1BHY58I";
const K_MAKEMORE3 = "https://www.youtube.com/watch?v=P6sfmUTpUmc";
const K_MAKEMORE4 = "https://www.youtube.com/watch?v=q8SA3rM6ckI";
const K_BUILD_GPT = "https://www.youtube.com/watch?v=kCc8FmEb1nY";
const K_TOKENIZER = "https://www.youtube.com/watch?v=zduSFxRajkE";
const K_GPT2 = "https://www.youtube.com/watch?v=l8pRSuU81PU";
// Papers
const P_ATTENTION = "https://arxiv.org/abs/1706.03762";
const P_INSTRUCTGPT = "https://arxiv.org/abs/2203.02155";
const P_DPO = "https://arxiv.org/abs/2305.18290";

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
      { title: "Watch + absorb: 3B1B EoLA Ch.1 — Vectors (10m video)", kind: "watch", minutes: 20, url: LA1 },
      { title: "Watch + absorb: 3B1B EoLA Ch.2 — Span & basis (10m video)", kind: "watch", minutes: 20, url: LA2 },
      { title: "Watch + absorb: 3B1B EoLA Ch.3 — Linear transformations (11m video)", kind: "watch", minutes: 22, url: LA3 },
      { title: "Watch + absorb: 3B1B EoLA Ch.4 — Matrix multiplication (10m video)", kind: "watch", minutes: 20, url: LA4 },
      { title: "Read week01 README (matrix_multiply brief)", kind: "read", minutes: 5 },
      { title: "Build: implement shape() + dot() — verify: `pytest -k \"shape or dot\"`", kind: "build", minutes: 30 },
      { title: "Build: implement transpose() — verify: `pytest -k transpose`", kind: "build", minutes: 20 },
      { title: "Build: implement matmul() (reuses transpose + dot) → run the whole file green", kind: "build", minutes: 40 },
      { title: "Checkpoint: explain matrix multiplication out loud, no notes", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + `git commit`", kind: "note", minutes: 15 },
    ],
  },
  {
    id: "week02",
    phase: "Phase 1 — Math",
    title: "Linear transformations & basis",
    steps: [
      { title: "Watch + absorb: 3B1B EoLA Ch.5 — 3D linear transformations (5m)", kind: "watch", minutes: 12, url: LA5 },
      { title: "Watch + absorb: 3B1B EoLA Ch.6 — The determinant (10m)", kind: "watch", minutes: 20, url: LA6 },
      { title: "Watch + absorb: 3B1B EoLA Ch.13 — Change of basis (13m)", kind: "watch", minutes: 26, url: LA13 },
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
      { title: "Watch + absorb: 3B1B EoLA Ch.7 — Inverse, column space, rank (12m)", kind: "watch", minutes: 24, url: LA7 },
      { title: "Watch + absorb: 3B1B EoLA Ch.9 — Dot products & duality (14m)", kind: "watch", minutes: 28, url: LA9 },
      { title: "Watch + absorb: 3B1B EoLA Ch.14 — Eigenvectors & eigenvalues (17m)", kind: "watch", minutes: 32, url: LA14 },
      { title: "Read week03 README (PCA intuition brief)", kind: "read", minutes: 5 },
      { title: "Build: pca_intuition.py — implement principal_components(); plot eigenvectors on the data", kind: "build", minutes: 90 },
      { title: "Checkpoint: explain what an eigenvector actually is", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week04",
    phase: "Phase 1 — Math",
    title: "Derivatives & gradients",
    steps: [
      { title: "Watch + absorb: 3B1B EoCalc Ch.1 — The essence of calculus (17m)", kind: "watch", minutes: 30, url: CALC1 },
      { title: "Watch + absorb: 3B1B EoCalc Ch.2 — Paradox of the derivative (17m)", kind: "watch", minutes: 30, url: CALC2 },
      { title: "Watch + absorb: 3B1B EoCalc Ch.3 — Derivative formulas via geometry (18m)", kind: "watch", minutes: 32, url: CALC3 },
      { title: "Read week04 README (gradient-descent brief)", kind: "read", minutes: 5 },
      { title: "Build: gradient_descent.py — implement grad() + descend(); plot the trajectory", kind: "build", minutes: 75 },
      { title: "Checkpoint: derive the GD update rule; explain the learning rate", kind: "checkpoint", minutes: 10 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week05",
    phase: "Phase 1 — Math",
    title: "Partial derivatives & the chain rule",
    steps: [
      { title: "Watch + absorb: 3B1B EoCalc Ch.4 — Chain rule & product rule (16m)", kind: "watch", minutes: 28, url: CALC4 },
      { title: "Watch + absorb: 3B1B NN Ch.3 — What is backpropagation really doing? (13m)", kind: "watch", minutes: 24, url: NN3 },
      { title: "Watch + absorb: 3B1B NN Ch.4 — Backpropagation calculus (10m)", kind: "watch", minutes: 20, url: NN4 },
      { title: "Build: manual_backprop.py — implement grad_analytic(); confirm it matches finite differences", kind: "build", minutes: 90 },
      { title: "Checkpoint: hand-derive backprop for a 2-layer net", kind: "checkpoint", minutes: 15 },
      { title: "Write your note + commit", kind: "note", minutes: 10 },
    ],
  },
  {
    id: "week06",
    phase: "Phase 1 — Math",
    title: "Probability & Bayes",
    steps: [
      { title: "Watch + absorb: StatQuest — Bayes' Theorem, clearly explained (14m)", kind: "watch", minutes: 24, url: SQ_BAYES },
      { title: "Read week06 README (coin_flips brief)", kind: "read", minutes: 5 },
      { title: "Build: coin_flips.py — empirical_probability, simulate_flips, running_estimates → `pytest`", kind: "build", minutes: 45 },
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
      { title: "Watch + absorb: StatQuest — Probability distributions (5m)", kind: "watch", minutes: 12, url: SQ_DIST },
      { title: "Watch + absorb: StatQuest — Expected values (14m)", kind: "watch", minutes: 24, url: SQ_EXP },
      { title: "Watch + absorb: StatQuest — Mean, variance & standard deviation (14m)", kind: "watch", minutes: 24, url: SQ_VAR },
      { title: "Build: distributions.py — implement empirical_stats() + bernoulli_entropy(); plot vs theory", kind: "build", minutes: 70 },
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
  "Phase 3 — Neural Nets": "https://karpathy.ai/zero-to-hero.html",
  "Phase 4 — Deep Learning": "https://cs231n.stanford.edu/",
  "Phase 5 — Transformers": "https://cs336.stanford.edu/",
  "Phase 6 — LLM Engineering": "https://huggingface.co/learn/llm-course",
  "Phase 7 — RLHF": "https://huggingface.co/learn/deep-rl-course",
  "Phase 8 — Agents": "https://www.anthropic.com/engineering/building-effective-agents",
  "Phase 9 — Research": "https://huggingface.co/papers",
  "Phase 10 — Advanced": "https://transformer-circuits.pub/",
  Portfolio: "",
};

// Verified per-week primary resources (researched 2026-07): the coarse weeks'
// watch step deep-links here instead of a course homepage. Do NOT reorder or
// add steps in coarse weeks — step ids (weekNN.i) key user progress.
const WEEK_LINKS: Record<string, { title: string; url: string; minutes: number; extraTitle?: string; extraUrl?: string }> = {
  week09: { title: "Watch + absorb: StatQuest \u2014 Linear Regression, Clearly Explained!!! (27 min)", url: "https://www.youtube.com/watch?v=7ArmBVF2dCs", minutes: 50, extraTitle: "ISLR book (ch. 3, free PDF)", extraUrl: "https://www.statlearning.com/" },
  week10: { title: "Watch + absorb: StatQuest \u2014 Logistic Regression (9 min)", url: "https://www.youtube.com/watch?v=yIYKR4sgzI8", minutes: 25, extraTitle: "ISLR book (ch. 4, free PDF)", extraUrl: "https://www.statlearning.com/" },
  week11: { title: "Watch + absorb: StatQuest \u2014 Decision and Classification Trees, Clearly Explained!!! (18 min)", url: "https://www.youtube.com/watch?v=_L39rN6gz7Y", minutes: 35, extraTitle: "ISLR book (ch. 8, free PDF)", extraUrl: "https://www.statlearning.com/" },
  week12: { title: "Watch + absorb: StatQuest \u2014 Random Forests Part 1 (10 min)", url: "https://www.youtube.com/watch?v=J4Wdy0Wc_xQ", minutes: 25, extraTitle: "ISLR book (ch. 8.2, free PDF)", extraUrl: "https://www.statlearning.com/" },
  week13: { title: "Watch + absorb: StatQuest \u2014 K-means clustering (9 min)", url: "https://www.youtube.com/watch?v=4b5d3muPQmA", minutes: 20, extraTitle: "ISLR book (ch. 12.4, free PDF)", extraUrl: "https://www.statlearning.com/" },
  week14: { title: "Watch + absorb: StatQuest \u2014 PCA main ideas (6 min) + Step-by-Step (22 min)", url: "https://www.youtube.com/watch?v=HMOI_lkzW08", minutes: 55, extraTitle: "StatQuest \u2014 PCA Step-by-Step", extraUrl: "https://www.youtube.com/watch?v=FgakZw6K1QQ" },
  week15: { title: "Read: Red Blob Games \u2014 Introduction to A* (interactive)", url: "https://www.redblobgames.com/pathfinding/a-star/introduction.html", minutes: 60 },
  week16: { title: "Read: Kaggle Datasets \u2014 pick your capstone dataset", url: "https://www.kaggle.com/datasets", minutes: 30 },
  week18: { title: "Watch + absorb: Karpathy micrograd, part 2 \u2014 backward per op (from 1:09:02)", url: "https://www.youtube.com/watch?v=VMj-3S1tku0&t=4142s", minutes: 65 },
  week20: { title: "Watch + absorb: Karpathy micrograd, part 3 \u2014 MLP + training (from 1:43:55)", url: "https://www.youtube.com/watch?v=VMj-3S1tku0&t=6235s", minutes: 75 },
  week21: { title: "Read: karpathy/micrograd repo \u2014 walkthrough + exercises", url: "https://github.com/karpathy/micrograd", minutes: 40, extraTitle: "Video final section (from 2:16:46)", extraUrl: "https://www.youtube.com/watch?v=VMj-3S1tku0&t=8206s" },
  week22: { title: "Read: PyTorch official tutorial \u2014 Learn the Basics", url: "https://docs.pytorch.org/tutorials/beginner/basics/intro.html", minutes: 90 },
  week23: { title: "Watch + absorb: StatQuest \u2014 ReLU In Action!!! (9 min)", url: "https://www.youtube.com/watch?v=68BZ5f7P94E", minutes: 45, extraTitle: "CS231n notes \u2014 activation functions", extraUrl: "https://cs231n.github.io/neural-networks-1/" },
  week27: { title: "Read: karpathy/micrograd repo \u2014 study the source end to end", url: "https://github.com/karpathy/micrograd", minutes: 40, extraTitle: "karpathy/nn-zero-to-hero repo", extraUrl: "https://github.com/karpathy/nn-zero-to-hero" },
  week28: { title: "Read: karpathy/nn-zero-to-hero repo \u2014 exercises + notebooks", url: "https://github.com/karpathy/nn-zero-to-hero", minutes: 40, extraTitle: "karpathy/micrograd repo", extraUrl: "https://github.com/karpathy/micrograd" },
  week29: { title: "Read: CS231n notes \u2014 Convolutional Neural Networks", url: "https://cs231n.github.io/convolutional-networks/", minutes: 90 },
  week30: { title: "Watch + absorb: 3Blue1Brown \u2014 But what is a convolution? (23 min)", url: "https://www.youtube.com/watch?v=KuXjwB4LzSA", minutes: 45, extraTitle: "CS231n conv notes", extraUrl: "https://cs231n.github.io/convolutional-networks/" },
  week31: { title: "Read: Karpathy \u2014 The Unreasonable Effectiveness of RNNs", url: "https://karpathy.github.io/2015/05/21/rnn-effectiveness/", minutes: 60 },
  week32: { title: "Read: colah \u2014 Understanding LSTM Networks", url: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/", minutes: 45 },
  week33: { title: "Read: Jay Alammar \u2014 The Illustrated Word2vec", url: "https://jalammar.github.io/illustrated-word2vec/", minutes: 45 },
  week34: { title: "Read: Jay Alammar \u2014 Visualizing seq2seq + attention", url: "https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/", minutes: 30 },
  week35: { title: "Watch + absorb: 3Blue1Brown \u2014 Attention in transformers (26 min)", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc", minutes: 50, extraTitle: "Jay Alammar \u2014 The Illustrated Transformer", extraUrl: "https://jalammar.github.io/illustrated-transformer/" },
  week36: { title: "Read: HF LLM Course ch. 3 \u2014 Fine-tuning (text classification)", url: "https://huggingface.co/learn/llm-course/chapter3/1", minutes: 60 },
  week39: { title: "Watch + absorb: 3B1B \u2014 Attention in transformers (multi-head section)", url: "https://www.youtube.com/watch?v=eMlx5fFNoYc", minutes: 50, extraTitle: "Illustrated Transformer \u2014 multi-head section", extraUrl: "https://jalammar.github.io/illustrated-transformer/" },
  week40: { title: "Read: The Annotated Transformer (Harvard NLP)", url: "https://nlp.seas.harvard.edu/annotated-transformer/", minutes: 120 },
  week41: { title: "Read: HF LLM Course \u2014 How do Transformers work?", url: "https://huggingface.co/learn/llm-course/chapter1/4", minutes: 60 },
  week42: { title: "Read: HF LLM Course \u2014 Transformers (decoder focus)", url: "https://huggingface.co/learn/llm-course/chapter1/4", minutes: 60, extraTitle: "Illustrated Transformer \u2014 decoder section", extraUrl: "https://jalammar.github.io/illustrated-transformer/" },
  week44: { title: "Read: Kazemnejad \u2014 The Positional Encoding", url: "https://kazemnejad.com/blog/transformer_architecture_positional_encoding/", minutes: 60 },
  week45: { title: "Read: karpathy/nanoGPT repo \u2014 model.py + train.py", url: "https://github.com/karpathy/nanoGPT", minutes: 40, extraTitle: "Karpathy \u2014 Let's build GPT (1h57m)", extraUrl: "https://www.youtube.com/watch?v=kCc8FmEb1nY" },
  week46: { title: "Read: karpathy/nanoGPT repo \u2014 training loop deep dive", url: "https://github.com/karpathy/nanoGPT", minutes: 40, extraTitle: "Karpathy \u2014 Let's build GPT (1h57m)", extraUrl: "https://www.youtube.com/watch?v=kCc8FmEb1nY" },
  week47: { title: "Read: karpathy/nanoGPT repo \u2014 sample.py + generation", url: "https://github.com/karpathy/nanoGPT", minutes: 40, extraTitle: "Karpathy \u2014 GPT Tokenizer (2h13m)", extraUrl: "https://www.youtube.com/watch?v=zduSFxRajkE" },
  week49: { title: "Read: HF blog \u2014 Getting Started With Embeddings", url: "https://huggingface.co/blog/getting-started-with-embeddings", minutes: 60 },
  week50: { title: "Read: Chroma docs \u2014 Getting Started", url: "https://docs.trychroma.com/docs/overview/getting-started", minutes: 45 },
  week51: { title: "Read: Sentence-Transformers docs \u2014 Semantic Search", url: "https://www.sbert.net/examples/applications/semantic-search/README.html", minutes: 60 },
  week52: { title: "Read: HF Cookbook \u2014 Simple RAG", url: "https://huggingface.co/learn/cookbook/rag_zephyr_langchain", minutes: 75 },
  week53: { title: "Read: HF Cookbook \u2014 Advanced RAG", url: "https://huggingface.co/learn/cookbook/advanced_rag", minutes: 90 },
  week54: { title: "Read: Hamel Husain \u2014 Your AI Product Needs Evals", url: "https://hamel.dev/blog/posts/evals/", minutes: 90 },
  week55: { title: "Read: HF LLM Course \u2014 Fine-tuning with the Trainer API", url: "https://huggingface.co/learn/llm-course/chapter3/3", minutes: 60 },
  week56: { title: "Read: HF PEFT docs \u2014 LoRA conceptual guide", url: "https://huggingface.co/docs/peft/conceptual_guides/lora", minutes: 45 },
  week57: { title: "Read: HF Transformers docs \u2014 Quantization overview", url: "https://huggingface.co/docs/transformers/quantization/overview", minutes: 60 },
  week58: { title: "Read: kipply \u2014 Transformer Inference Arithmetic", url: "https://kipp.ly/transformer-inference-arithmetic/", minutes: 90 },
  week59: { title: "Read: vLLM docs \u2014 Quickstart", url: "https://docs.vllm.ai/en/latest/getting_started/quickstart.html", minutes: 45 },
  week60: { title: "Read: vLLM docs \u2014 Quickstart (serve your capstone model)", url: "https://docs.vllm.ai/en/latest/getting_started/quickstart.html", minutes: 30 },
  week61: { title: "Read: HF Deep RL Course \u2014 Unit 1: Intro to Deep RL", url: "https://huggingface.co/learn/deep-rl-course/unit1/introduction", minutes: 90 },
  week62: { title: "Read: HF Deep RL Course \u2014 Unit 2: Q-Learning", url: "https://huggingface.co/learn/deep-rl-course/unit2/introduction", minutes: 90 },
  week63: { title: "Read: OpenAI Spinning Up \u2014 Intro to Policy Optimization", url: "https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html", minutes: 120 },
  week64: { title: "Read: HF blog \u2014 Illustrating RLHF", url: "https://huggingface.co/blog/rlhf", minutes: 60 },
  week65: { title: "Read: HF TRL docs \u2014 Dataset formats (preference data)", url: "https://huggingface.co/docs/trl/dataset_formats", minutes: 45 },
  week66: { title: "Read: HF TRL docs \u2014 DPO Trainer", url: "https://huggingface.co/docs/trl/dpo_trainer", minutes: 60 },
  week67: { title: "Read: EleutherAI lm-evaluation-harness repo", url: "https://github.com/EleutherAI/lm-evaluation-harness", minutes: 40 },
  week68: { title: "Read: HF TRL docs \u2014 plan your RLHF capstone", url: "https://huggingface.co/docs/trl/index", minutes: 30 },
  week69: { title: "Read: Claude docs \u2014 Tool use overview", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview", minutes: 60 },
  week70: { title: "Read: Lilian Weng \u2014 LLM Powered Autonomous Agents (memory)", url: "https://lilianweng.github.io/posts/2023-06-23-agent/", minutes: 90 },
  week71: { title: "Read: ReAct paper (arXiv 2210.03629)", url: "https://arxiv.org/abs/2210.03629", minutes: 90, extraTitle: "Lilian Weng \u2014 Agents (planning section)", extraUrl: "https://lilianweng.github.io/posts/2023-06-23-agent/" },
  week72: { title: "Read: Reflexion paper (arXiv 2303.11366)", url: "https://arxiv.org/abs/2303.11366", minutes: 90 },
  week73: { title: "Read: Model Context Protocol docs \u2014 Introduction", url: "https://modelcontextprotocol.io/docs/getting-started/intro", minutes: 60 },
  week74: { title: "Read: Anthropic \u2014 How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", minutes: 45 },
  week75: { title: "Read: Anthropic \u2014 Demystifying evals for AI agents", url: "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents", minutes: 45 },
  week76: { title: "Read: Anthropic \u2014 Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents", minutes: 60 },
};

// Override the coarse "watch" step for weeks with a known key video/paper.
const SPECIAL_WATCH: Record<string, StepDef> = {
  week17: { title: "Watch + code along: Karpathy — building micrograd (2h26m)", kind: "watch", minutes: 210, url: K_MICROGRAD },
  week24: { title: "Watch + code along: Karpathy — makemore 3 (activations, BatchNorm) (1h56m)", kind: "watch", minutes: 170, url: K_MAKEMORE3 },
  week25: { title: "Watch + code along: Karpathy — makemore 1 (bigram language model) (1h58m)", kind: "watch", minutes: 170, url: K_MAKEMORE1 },
  week26: { title: "Watch + code along: Karpathy — makemore 2 (MLP) (1h16m)", kind: "watch", minutes: 120, url: K_MAKEMORE2 },
  week19: { title: "Watch + code along: Karpathy — makemore 4 (becoming a backprop ninja) (1h55m)", kind: "watch", minutes: 170, url: K_MAKEMORE4 },
  week37: { title: "Read the paper: Attention Is All You Need", kind: "paper", minutes: 120, url: P_ATTENTION },
  week38: { title: "Watch + code along: Karpathy — Let's build GPT from scratch (1h56m)", kind: "watch", minutes: 180, url: K_BUILD_GPT },
  week43: { title: "Watch + code along: Karpathy — Let's build the GPT Tokenizer (2h13m)", kind: "watch", minutes: 190, url: K_TOKENIZER },
  week48: { title: "Watch + code along: Karpathy — Let's reproduce GPT-2 (124M) (4h01m)", kind: "watch", minutes: 300, url: K_GPT2 },
  week64: { title: "Read the paper: InstructGPT (RLHF)", kind: "paper", minutes: 120, url: P_INSTRUCTGPT },
  week66: { title: "Read the paper: DPO — Direct Preference Optimization", kind: "paper", minutes: 120, url: P_DPO },
};

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
  const link = WEEK_LINKS[id];
  const watch: StepDef =
    SPECIAL_WATCH[id] ??
    (link
      ? { title: link.title, kind: link.title.startsWith("Read:") ? "read" : "watch", minutes: link.minutes, url: link.url }
      : { title: `Watch the week's lectures — pick the specific videos (time est.)`, kind: "watch", minutes: 180, url: PHASE_PRIMARY[phase] || undefined });
  // A secondary reference (if researched) rides on the first build step's link.
  const build1: StepDef = {
    title: `Build: ${title}` + (link?.extraTitle ? ` — ref: ${link.extraTitle}` : ""),
    kind: "build",
    minutes: 150,
    url: link?.extraUrl,
  };
  return {
    id,
    phase,
    title,
    steps: [
      watch,
      build1,
      { title: `Keep building + exercises: ${title}`, kind: "build", minutes: 150 },
      { title: `Checkpoint — confirm you can explain it out loud`, kind: "checkpoint", minutes: 30 },
      { title: `Write your note & commit`, kind: "note", minutes: 30 },
    ],
  };
}

export const WEEKS: WeekDef[] = [...DETAILED, ...REST.map(expand)];
