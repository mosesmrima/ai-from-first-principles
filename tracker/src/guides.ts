// Per-week guidance: WHY you're learning this (what it builds toward) and what's
// actually WORTH REMEMBERING (so you don't burn motivation on the wrong details).
// Shown at the top of the Now view for the current week.

export interface Guide {
  why: string;
  remember: string[];
}

export const GUIDES: Record<string, Guide> = {
  week00: {
    why: "A frictionless environment is what makes the next 18 months sustainable. You're not learning AI today — you're removing every excuse future-you could use to skip a session.",
    remember: [
      "The one rule: you advance by building, not by watching.",
      "Where things live: the app tells you what's next; the repo holds what you build.",
    ],
  },
  week01: {
    why: "Every neural network is, at its core, matrix multiplication — a GPT forward pass is thousands of matmuls. If you can write matmul with bare loops, no framework will ever be a black box to you.",
    remember: [
      "A dot product measures alignment between two vectors — this IS 'attention' later.",
      "matmul: result[i][j] = row i of A · column j of B; inner dimensions must match.",
      "Rows are how matrices are stored; columns are what transformations mean.",
    ],
  },
  week02: {
    why: "A matrix IS a transformation of space. Every layer of a neural net warps its input space exactly like your visualizer warps the plane — training a net is learning which warp to apply.",
    remember: [
      "The columns of a matrix are where î and ĵ land. That's the whole matrix.",
      "The determinant = how much area gets scaled; 0 means information is destroyed.",
      "Composition of transformations = matrix multiplication (order matters).",
    ],
  },
  week03: {
    why: "Eigenvectors are the directions a transformation leaves alone — and PCA (finding the directions data varies most) is your first real ML algorithm. This intuition returns in embeddings, attention patterns, and why deep nets are trainable at all.",
    remember: [
      "An eigenvector only gets stretched (by its eigenvalue), never rotated.",
      "PCA = eigenvectors of the covariance matrix = directions of maximum variance.",
      "Don't memorize the algebra — remember the picture: arrows that keep their direction.",
    ],
  },
  week04: {
    why: "Gradient descent is THE algorithm of deep learning — every model you'll ever train, from logistic regression to GPT, learns by exactly this loop: measure slope, step downhill, repeat.",
    remember: [
      "The gradient points uphill; you step in the negative direction: x ← x − lr·∇f.",
      "The learning rate is the most important hyperparameter you'll ever tune.",
      "Too small = slow crawl; too big = divergence. You watched it happen — that picture is the lesson.",
    ],
  },
  week05: {
    why: "The chain rule is the single most important piece of math in this entire curriculum — backpropagation IS the chain rule applied through a computation graph. Master this week and Phase 3's micrograd will feel obvious instead of magical.",
    remember: [
      "Chain rule: sensitivities multiply along a path — dL/dw = dL/de · de/dw.",
      "Finite differences are your ground truth for checking any gradient, forever.",
      "Backprop is just the chain rule organized efficiently — nothing more.",
    ],
  },
  week06: {
    why: "ML models don't output answers — they output probabilities. Bayes' theorem is how evidence updates belief, and it's behind everything from spam filters to why language models are 'just' probability distributions over the next token.",
    remember: [
      "Bayes: P(A|B) = P(B|A)·P(A)/P(B) — posterior comes from prior × evidence.",
      "Base rates dominate: a 99%-accurate test on a rare condition is mostly false positives.",
      "The law of large numbers: empirical frequency converges to true probability. You plotted it.",
    ],
  },
  week07: {
    why: "Loss functions are built from expectations; training curves are variance in action; and cross-entropy — the loss every LLM minimizes — is literally the entropy concept from this week. This is the vocabulary of every ML paper you'll read.",
    remember: [
      "E[X] = the long-run average; Var[X] = spread around it.",
      "Entropy = expected surprise; it peaks when outcomes are 50/50 (maximum uncertainty).",
      "The Gaussian is everywhere because sums of independent things become Gaussian (CLT).",
    ],
  },
  week08: {
    why: "This capstone is your first complete ML system: model, loss, gradients, training loop — the exact skeleton of every neural network. Once this clicks, deep learning is 'the same thing, but with more layers'.",
    remember: [
      "The training loop: predict → measure loss → compute gradients → update. Everything is this.",
      "MSE for regression, log-loss for classification — and WHY sigmoid pairs with log-loss.",
      "You wrote fit() and predict() from raw math. sklearn is now a convenience, not a mystery.",
    ],
  },
  week09: {
    why: "Seeing the closed-form solution next to gradient descent teaches you when optimization is even necessary — and the normal equation's failure modes (huge/singular matrices) are exactly why deep learning uses iterative methods.",
    remember: [
      "Two roads to the same answer: algebra (normal equation) vs iteration (GD).",
      "Closed form breaks at scale — that's why everything downstream iterates.",
    ],
  },
  week10: {
    why: "Precision, recall, and cross-validation are how practitioners avoid lying to themselves. Every model you ever ship will be judged by the evaluation discipline you build this week.",
    remember: [
      "Accuracy is misleading on imbalanced data — precision/recall tell the real story.",
      "Never evaluate on data you trained on; k-fold is the honest default.",
    ],
  },
  week11: {
    why: "Decision trees teach recursive problem decomposition and information gain — entropy applied to make decisions. Trees also power gradient boosting, which still beats neural nets on most tabular data.",
    remember: [
      "A split is good if it reduces entropy/impurity — information gain is entropy arithmetic.",
      "Unconstrained trees memorize the training set — your first visceral overfitting experience.",
    ],
  },
  week12: {
    why: "Random forests introduce ensembling: many weak, diverse models beating one strong one. That principle — variance reduction through diversity — reappears in dropout, model souping, and mixture-of-experts.",
    remember: [
      "Bagging + random features = decorrelated trees = variance cancels out.",
      "Averaging many overfit models can generalize — a deep and reusable trick.",
    ],
  },
  week13: {
    why: "K-means is your first unsupervised algorithm — finding structure without labels. The assign-then-update loop is the same alternating-optimization pattern behind EM, vector quantization, and modern embedding clustering.",
    remember: [
      "Assign to nearest centroid, recompute centroids, repeat — that alternation converges.",
      "Bad initialization = bad local optimum; k-means++ exists for a reason.",
    ],
  },
  week14: {
    why: "Implementing PCA closes the loop you opened in Week 3 — the eigenvector intuition becomes working dimensionality reduction. Compressing data while keeping variance is the ancestor of every embedding you'll use.",
    remember: [
      "Center → covariance → eigendecompose → project. Four steps, that's PCA.",
      "Explained variance tells you how many dimensions actually matter.",
      "Bias-variance tradeoff: model complexity is a dial, not a virtue.",
    ],
  },
  week15: {
    why: "A* is classical AI's crown jewel and your first taste of search — which is having a renaissance in LLM agents (tree-of-thought, planning). Heuristics that guide without misleading is a transferable design principle.",
    remember: [
      "A* = Dijkstra + heuristic; admissible (never-overestimating) heuristics keep it optimal.",
      "Search + evaluation function is a pattern modern agents are rediscovering.",
    ],
  },
  week16: {
    why: "The capstone forces integration: one codebase where regression, classification, and clustering share interfaces. Integration is where 'I watched it' becomes 'I own it' — and this is portfolio evidence.",
    remember: [
      "Your from-scratch algorithms all share one shape: fit(X, y) / predict(X).",
      "You now know what sklearn does inside. That knowledge is permanent.",
    ],
  },
  week17: {
    why: "This is the most important week of the curriculum. The Value class you build IS the core of PyTorch — a number that remembers how it was computed so gradients can flow backward. Everything after this is scale, not new magic.",
    remember: [
      "Each Value stores: data, grad, and a closure that pushes gradient to its parents.",
      "Gradients ACCUMULATE (+=) because a value used twice gets blame from both paths.",
      "This tiny class is conceptually identical to torch.Tensor with requires_grad=True.",
    ],
  },
  week18: {
    why: "Extending micrograd's backward pass teaches you that autograd is bookkeeping, not calculus — each op knows only its local derivative, and the chain rule composes them. Debugging gradients becomes a skill you'll use for life.",
    remember: [
      "Every op defines: forward result + local gradient rule. That's the entire contract.",
      "If gradients look wrong, finite-difference check ONE op at a time.",
    ],
  },
  week19: {
    why: "Topological sort is why backprop visits nodes in the right order — you can't blame your inputs before you know your own blame. This week turns 'backprop' from a word into an algorithm you can write on a whiteboard.",
    remember: [
      "Backward = reverse topological order + chain rule at each node.",
      "One backward() call computes ALL gradients in one pass — that efficiency is why deep learning works.",
    ],
  },
  week20: {
    why: "An MLP is just Values wired into layers — proof that 'neural network' means 'a big differentiable expression'. After this week the phrase 'the model has 7B parameters' means something concrete to you: 7B little knobs with gradients.",
    remember: [
      "Neuron = dot(w, x) + b passed through a nonlinearity; layer = list of neurons.",
      "Without nonlinearities, stacked layers collapse into one linear map — activations are what buy depth.",
    ],
  },
  week21: {
    why: "First end-to-end training on real data. You'll watch loss fall, plateau, and wobble — and learn to read those curves like an ECG. That diagnostic eye is 80% of practical deep learning.",
    remember: [
      "Loss going down = learning; loss NaN = learning rate too high; train≪val loss = overfitting.",
      "Always overfit a tiny batch first — if you can't, your code is broken.",
    ],
  },
  week22: {
    why: "SGD, Momentum, and Adam are the engines of all training. Implementing them shows they're three lines of update-rule each — and PyTorch stops being a framework and becomes a convenience library for math you own.",
    remember: [
      "Momentum = a moving average of gradients; Adam = momentum + per-parameter scaling.",
      "Adam is the safe default; SGD+momentum often generalizes better when tuned.",
      "PyTorch tensors = micrograd Values, vectorized and on GPU. Same idea exactly.",
    ],
  },
  week23: {
    why: "Activation functions decide what signals survive a layer. Understanding saturation (why sigmoid kills gradients) explains a decade of architecture history — and why ReLU's brutal simplicity won.",
    remember: [
      "Sigmoid/tanh saturate → gradients vanish → deep nets couldn't train before ReLU.",
      "ReLU: max(0, x). Cheap, sparse, non-saturating for x>0. Default choice.",
    ],
  },
  week24: {
    why: "Dropout and batchnorm are the difference between nets that memorize and nets that generalize. BatchNorm also teaches a deeper lesson: controlling the statistics of activations is as important as the architecture.",
    remember: [
      "Dropout = train an implicit ensemble by randomly muting neurons.",
      "BatchNorm keeps activations well-scaled so gradients stay healthy at depth.",
      "Both behave DIFFERENTLY at train vs eval time — the classic source of bugs.",
    ],
  },
  week25: {
    why: "makemore begins language modeling: predicting the next character. Every idea in GPT exists here in miniature — vocabulary, context, sampling. You're building the smallest possible LLM.",
    remember: [
      "A language model is a next-token probability distribution. Nothing more mystical.",
      "Counting bigrams and training a net converge to the same answer — models learn statistics.",
    ],
  },
  week26: {
    why: "Extending makemore to an MLP with embeddings introduces THE idea of modern NLP: represent discrete symbols as learned vectors. Every embedding table in every LLM is this week's concept.",
    remember: [
      "Embedding = a learned lookup table row per token; similar tokens drift together.",
      "More context = better predictions = more parameters. The scaling story starts here.",
    ],
  },
  week27: {
    why: "Consolidating micrograd into a reusable framework is how you find the leaks in your understanding — APIs force clarity. This is portfolio project #3 and your proof of first-principles mastery.",
    remember: [
      "A framework is: autograd + modules + optimizer + training loop. You've built each piece.",
      "Design for the user you'll be in Phase 4 — you're your own first customer.",
    ],
  },
  week28: {
    why: "Finishing and documenting the framework cements it. Writing the README teaches you what you actually built; the gaps you can't explain are the gaps to close before transformers.",
    remember: [
      "If you can't explain a component in two sentences, you don't own it yet.",
      "This artifact IS your credibility: 'I built a neural net framework from scratch.'",
    ],
  },
  week29: {
    why: "CNNs introduce inductive bias: baking assumptions (locality, translation invariance) into architecture. Understanding WHY convolutions fit images prepares you to understand why attention fits language.",
    remember: [
      "Convolution = the same small filter slid everywhere = massive weight sharing.",
      "Architecture encodes assumptions about data. Match the bias to the domain.",
    ],
  },
  week30: {
    why: "Writing conv2d by hand demystifies the operation that carried computer vision for a decade — and makes you appreciate what cuDNN does. Feeling the O(pixels × filter) cost explains why GPUs matter.",
    remember: [
      "Conv output = dot products of a sliding window — it's matmul in a trench coat.",
      "Padding and stride control output size; channels stack learned features.",
    ],
  },
  week31: {
    why: "RNNs are how sequence modeling was done pre-transformer — and their failure (forgetting long contexts) is the exact problem attention was invented to solve. You need to feel this pain to understand the cure.",
    remember: [
      "An RNN is one network applied repeatedly, passing a hidden state forward.",
      "Backprop through time = the chain rule through a very deep unrolled graph → vanishing gradients.",
    ],
  },
  week32: {
    why: "LSTMs are the patch on RNN forgetting: gates that control what to keep. Gating — letting the network learn what to remember — is an idea that survives inside modern architectures.",
    remember: [
      "Gates are learned sigmoids multiplying signals: forget, input, output.",
      "LSTMs bought 10 years of NLP progress but still process tokens serially — the bottleneck transformers removed.",
    ],
  },
  week33: {
    why: "Word embeddings are semantic geometry: king − man + woman ≈ queen. Visualizing them makes 'meaning as direction in vector space' concrete — the foundation of every LLM's understanding.",
    remember: [
      "Words that appear in similar contexts get similar vectors (distributional hypothesis).",
      "Embedding arithmetic works because directions encode relationships.",
    ],
  },
  week34: {
    why: "Seq2seq (encode source → decode target) framed translation, summarization, and chat as one problem. Its bottleneck — squeezing a sentence into one vector — is precisely what attention fixed.",
    remember: [
      "Encoder-decoder with a single context vector chokes on long inputs.",
      "That choke point is WHY attention exists. Next week is the payoff.",
    ],
  },
  week35: {
    why: "This is the hinge of the entire curriculum: attention lets every position look at every other position and decide what's relevant. Build it from scratch now, and 'Attention Is All You Need' becomes readable.",
    remember: [
      "Attention = softmax(Q·Kᵀ/√d)·V — a soft, differentiable dictionary lookup.",
      "Q asks, K advertises, V delivers. Weights are just dot-product similarities.",
      "You already know every ingredient: dot products (wk1), softmax, matmul.",
    ],
  },
  week36: {
    why: "The sentiment capstone integrates embeddings, sequence processing, and classification into one shipped artifact — and closes the pre-transformer era of your training.",
    remember: [
      "Text → tokens → embeddings → sequence model → classifier. This pipeline shape recurs everywhere.",
      "You've now built vision AND language models the hard way. Transformers unify them.",
    ],
  },
  week37: {
    why: "Reading the transformer paper AFTER building attention means you read as a peer, not a tourist. This is also your induction into the core skill of Phase 9: converting papers into understanding.",
    remember: [
      "The transformer's bet: attention alone, no recurrence → total parallelism → scale.",
      "Multi-head = several attentions with different learned 'perspectives' in parallel.",
      "Note what confuses you — those notes become the next weeks' targets.",
    ],
  },
  week38: {
    why: "Implementing scaled dot-product attention in code you can test is the difference between citing the equation and owning it. The √d scaling term teaches numerical care at model scale.",
    remember: [
      "Without /√d, dot products grow with dimension → softmax saturates → gradients die.",
      "Masking = setting scores to −∞ before softmax so the future is invisible.",
    ],
  },
  week39: {
    why: "Multi-head attention is where the model gets its richness — one head tracks syntax, another coreference. Implementing the reshape gymnastics (batch, head, seq, dim) builds the tensor fluency GPT work demands.",
    remember: [
      "Heads = split the embedding into H subspaces, attend separately, concat, project.",
      "Most attention bugs are shape bugs. Print shapes ruthlessly.",
    ],
  },
  week40: {
    why: "The transformer block — attention + MLP with residuals and layernorm — is the LEGO brick of all modern AI. GPT-4 is this block repeated ~100 times. Build one properly and you understand them all.",
    remember: [
      "Residual connections are gradient highways — they're what makes 100-layer models trainable.",
      "Attention mixes information ACROSS positions; the MLP processes each position alone.",
    ],
  },
  week41: {
    why: "Stacking blocks into an encoder shows how depth builds abstraction — early layers see tokens, deep layers see meaning. BERT is exactly this stack.",
    remember: [
      "An encoder is N identical blocks; representation quality grows with depth.",
      "Bidirectional context (seeing both sides) is what separates encoders from decoders.",
    ],
  },
  week42: {
    why: "The decoder's causal masking — each token only sees its past — is what makes generation possible. GPT is decoder-only; understand this and you understand GPT's architecture completely.",
    remember: [
      "Causal mask = lower-triangular attention. The future is hidden at train AND inference.",
      "Training predicts every next token in parallel; generation is one token at a time.",
    ],
  },
  week43: {
    why: "Tokenization is the unglamorous layer that shapes everything an LLM can do — why models are bad at spelling and arithmetic starts here. Building BPE yourself removes the last black box between raw text and the model.",
    remember: [
      "BPE: repeatedly merge the most frequent pair. Compression, applied to text.",
      "Most 'weird LLM behavior' traces back to tokenization.",
    ],
  },
  week44: {
    why: "Attention is order-blind — positional embeddings are how transformers know word order at all. It's a small component with an outsized conceptual lesson: information the architecture drops must be injected back.",
    remember: [
      "Without position info, 'dog bites man' = 'man bites dog'.",
      "Learned positions (GPT) vs sinusoidal (original) vs rotary (modern) — same job, different tricks.",
    ],
  },
  week45: {
    why: "First full transformer training run. Small scale, but every skill transfers directly: batching, LR warmup, loss curves, checkpointing. You're rehearsing the exact motions of week 48.",
    remember: [
      "Overfit a tiny dataset FIRST. It's the only proof your architecture is wired right.",
      "Warmup matters for transformers — they're unstable at the start of training.",
    ],
  },
  week46: {
    why: "Scaling to a real GPT-like run teaches the operational side: GPU memory budgeting, gradient accumulation, runs that take hours. This is what ML engineering actually feels like day-to-day.",
    remember: [
      "Params + activations + optimizer state = memory. Adam costs 2 extra copies of the model.",
      "Log everything; a run without metrics is a run you can't debug.",
    ],
  },
  week47: {
    why: "Sampling strategy is the personality knob of generation — the same model is boring under greedy decoding and unhinged at high temperature. This bridges 'trained model' to 'usable product'.",
    remember: [
      "Temperature scales logits before softmax; top-k/top-p truncate the tail.",
      "Generation quality problems are often SAMPLING problems, not model problems.",
    ],
  },
  week48: {
    why: "The nanoGPT reproduction is your thesis: tokenizer, model, training, generation — all yours. 'I trained a GPT from scratch' is a sentence very few engineers can say honestly. You'll be one of them.",
    remember: [
      "You now understand every line of the GPT stack. Papers are colleagues' memos now, not scripture.",
      "Document the run: numbers, curves, failures. That writeup is portfolio gold.",
    ],
  },
  week49: {
    why: "Embeddings turn 'meaning' into geometry you can search. Every RAG system, semantic search, and recommendation engine starts with this: similar things are near each other.",
    remember: [
      "Cosine similarity on embedding vectors = semantic relatedness.",
      "Embedding choice matters more than vector DB choice for retrieval quality.",
    ],
  },
  week50: {
    why: "Vector databases make embedding search fast at scale via approximate nearest neighbors. Knowing the recall/speed tradeoff keeps you from cargo-culting infrastructure you don't need.",
    remember: [
      "ANN search trades a little recall for orders-of-magnitude speed.",
      "Under ~1M vectors, a numpy array is often all you need. Don't over-engineer.",
    ],
  },
  week51: {
    why: "Semantic search over your own corpus is the first LLM-era system real users feel: ask in natural language, find by meaning. It's also the retrieval half of RAG, isolated for practice.",
    remember: [
      "Chunking strategy quietly dominates search quality — experiment with it.",
      "Hybrid (keyword + vector) beats either alone in practice.",
    ],
  },
  week52: {
    why: "RAG is how you give an LLM knowledge it wasn't trained on — the dominant architecture for grounded, current, private-data AI. Understanding the failure modes now saves months later.",
    remember: [
      "RAG = retrieve relevant context, stuff it in the prompt, generate.",
      "Most RAG failures are RETRIEVAL failures. Debug the search before blaming the model.",
    ],
  },
  week53: {
    why: "Building RAG end-to-end forces every hidden decision into the open: chunk size, top-k, prompt format, citation handling. The naive version you build first is the baseline that makes improvements measurable.",
    remember: [
      "Build the dumbest version first; measure; then improve deliberately.",
      "Garbage retrieval in = confident garbage out.",
    ],
  },
  week54: {
    why: "Evaluation is what separates engineers from demo-builders. LLM outputs are fuzzy, so you need eval sets and metrics before you can claim anything improved — this discipline is rare and valuable.",
    remember: [
      "A small, curated eval set you run every change beats vibes every time.",
      "Evaluate retrieval (did the right chunk come back?) separately from generation.",
    ],
  },
  week55: {
    why: "Fine-tuning specializes a general model to your task and format. Knowing when fine-tuning beats prompting (and when it doesn't) is a judgment call you'll be paid to make.",
    remember: [
      "Fine-tune for format/style/domain; RAG for facts. Mixing them up wastes money.",
      "Quality of a few thousand examples beats quantity of sloppy ones.",
    ],
  },
  week56: {
    why: "LoRA makes fine-tuning affordable: train tiny low-rank adapters instead of all weights. It's the eigenvalue insight from Week 3 applied to weight updates — low-rank structure captures most of what matters.",
    remember: [
      "LoRA freezes the base model and learns small A·B matrices per layer.",
      "~1% trainable parameters ≈ full fine-tune quality for most tasks.",
    ],
  },
  week57: {
    why: "Quantization (fp16 → int4) is why 70B models run on consumer hardware. Understanding precision/quality tradeoffs makes you the person who can actually deploy models, not just train them.",
    remember: [
      "Weights tolerate low precision surprisingly well; activations are touchier.",
      "QLoRA = fine-tune on top of a quantized base — accessible on one GPU.",
    ],
  },
  week58: {
    why: "The KV cache and batching are why inference is affordable at all. This systems knowledge — where latency and cost actually come from — is your differentiator as a systems-minded ML engineer.",
    remember: [
      "KV cache: keys/values of past tokens are reused, not recomputed. Generation is memory-bound.",
      "Throughput comes from batching; latency comes from model size and memory bandwidth.",
    ],
  },
  week59: {
    why: "The production RAG capstone assembles retrieval, evaluation, logging, and metrics into something you could genuinely charge money for. This is the 'LLM engineer' job description in one project.",
    remember: [
      "Logging every query/retrieval/response is what makes improvement possible.",
      "Your eval set from week 54 is the project's compass — run it on every change.",
    ],
  },
  week60: {
    why: "Finishing means hardening: error handling, cost tracking, the boring 20% that makes it real. Portfolio project #8 — and the most directly employable artifact so far.",
    remember: [
      "Production = graceful failure, observable behavior, known costs.",
      "Ship it with a README that shows the metrics. Numbers are credibility.",
    ],
  },
  week61: {
    why: "RL is a different learning paradigm: no labels, just consequences. You need its vocabulary (states, actions, rewards, policies) because the final stage of every modern LLM — alignment — speaks it.",
    remember: [
      "RL = learning what to DO from delayed, sparse feedback.",
      "Exploration vs exploitation is THE tension; everything else is machinery.",
    ],
  },
  week62: {
    why: "Q-learning makes RL concrete: a table of 'how good is this action here', updated by experience. Feeling tabular RL work (and fail to scale) motivates why deep RL and policy methods exist.",
    remember: [
      "Q(s,a) ← reward + γ·max future Q — the Bellman update, RL's chain rule.",
      "Tables don't scale; that's why neural nets replace them.",
    ],
  },
  week63: {
    why: "Policy gradients optimize behavior directly with the same gradient machinery you've used all along — REINFORCE is backprop where the 'loss' is negative reward. This is the direct ancestor of PPO in RLHF.",
    remember: [
      "Increase probability of actions that led to good outcomes. That's the whole idea.",
      "High variance is the curse; baselines and advantage functions are the medicine.",
    ],
  },
  week64: {
    why: "RLHF is how raw next-token predictors became assistants — the recipe (SFT → reward model → PPO) is arguably the most commercially important algorithm of the decade. This week you finally read InstructGPT as an insider.",
    remember: [
      "A reward model learns human preferences; PPO optimizes the LLM against it.",
      "The KL penalty keeps the model from goodharting the reward — alignment's central tension.",
    ],
  },
  week65: {
    why: "Preference data (A vs B comparisons) is the fuel of alignment. Building a dataset yourself teaches why comparisons beat ratings, and where labeling noise and bias creep in.",
    remember: [
      "Humans are far more consistent at 'which is better?' than 'rate this 1–10'.",
      "Preference data quality bounds everything downstream. Garbage preferences, garbage alignment.",
    ],
  },
  week66: {
    why: "DPO collapses RLHF's three-stage pipeline into one supervised loss — no reward model, no PPO. It's a beautiful example of math simplifying engineering, and it's what most open models actually use.",
    remember: [
      "DPO: the LLM is secretly its own reward model — optimize preferences directly.",
      "Simpler pipeline, comparable results. Elegance that ships.",
    ],
  },
  week67: {
    why: "Model evaluation is an unsolved, high-stakes problem — benchmarks saturate and leak. Building an eval harness teaches you to distrust leaderboards and measure what YOU care about.",
    remember: [
      "A benchmark score is a claim, not a fact. Contamination is everywhere.",
      "LLM-as-judge is useful but has its own biases (length, position, style).",
    ],
  },
  week68: {
    why: "The toy RLHF pipeline makes you one of the few who has touched every stage of the modern LLM recipe: pretrain (wk48) → preferences (wk65) → alignment (now). The full picture, hands-on.",
    remember: [
      "You've now built the complete arc: from matmul to aligned model.",
      "Alignment moves behavior, not knowledge — the base model's ceiling remains.",
    ],
  },
  week69: {
    why: "Agents = LLMs that act. Starting with a raw tool-calling loop (no framework) shows you the entire trick: a while-loop, a prompt, and parsing. Every agent framework is this loop with opinions.",
    remember: [
      "The agent loop: model proposes tool call → you execute → feed result back → repeat.",
      "Frameworks add convenience, not capability. The loop is the capability.",
    ],
  },
  week70: {
    why: "Context windows forget; memory systems are how agents persist. Designing short-term vs long-term memory is a real architecture problem — and embeddings (wk49) are your retrieval substrate.",
    remember: [
      "Memory = deciding what to store, how to retrieve it, when to inject it.",
      "Most 'agent memory' is just RAG over the agent's own history.",
    ],
  },
  week71: {
    why: "Planning loops (decompose → execute → check) are what separate agents that handle multi-step work from chatbots with tools. You're engineering around the model's tendency to lose the plot.",
    remember: [
      "Explicit plans the agent can re-read beat implicit plans in context.",
      "Verify progress at each step; drift compounds silently.",
    ],
  },
  week72: {
    why: "Reflection — the model critiquing its own output — is the cheapest quality boost in agent design. It also teaches you the limits: models grade their own homework generously.",
    remember: [
      "Generate → critique → revise reliably beats one-shot generation.",
      "Self-review with fresh context (or a second model) beats same-context review.",
    ],
  },
  week73: {
    why: "MCP standardizes how agents reach tools and data — USB for AI. Building a server positions you for the ecosystem forming around it, and Anthropic's own stack runs on it.",
    remember: [
      "MCP separates the agent (client) from capabilities (servers) with one protocol.",
      "A tool's DESCRIPTION is prompt engineering — the model chooses tools by reading them.",
    ],
  },
  week74: {
    why: "Multi-agent systems trade one overloaded context for several focused ones. Learning when delegation helps (parallelism, specialization) and when it's overhead is current frontier judgment.",
    remember: [
      "Sub-agents = context isolation. That's the real benefit, not anthropomorphic 'teams'.",
      "Communication between agents is the failure point. Keep interfaces small and typed.",
    ],
  },
  week75: {
    why: "Agent evaluation is genuinely unsolved — trajectories are long, failures are subtle, and success is fuzzy. Building traces and failure taxonomies puts you at the research frontier, not behind it.",
    remember: [
      "Trace everything; an un-observable agent is un-debuggable.",
      "Evaluate end outcomes AND trajectory quality — both can lie alone.",
    ],
  },
  week76: {
    why: "The security research agent is your thesis project: your security background + everything from this curriculum, fused into something nobody else could build the same way. This is the portfolio piece that gets conversations started.",
    remember: [
      "Your edge is the INTERSECTION: security expertise × from-scratch AI understanding.",
      "Ship it public, write it up, and let it represent you.",
    ],
  },
};
