# Phase 6 — LLM Engineering (Weeks 49–60)

**Goal:** stop being a prompt engineer. Retrieval, evaluation, fine-tuning, and inference —
the skills that turn a model into a product.

**Dependencies:** `uv sync --extra nlp --extra llmeng --extra posttrain`.

## Resources
- Full Stack Deep Learning — LLM Bootcamp (YouTube)
- DataTalksClub — LLM Zoomcamp
- Hugging Face (TRL, PEFT, Transformers docs)
- vLLM docs (docs.vllm.ai) · CS336 systems sections
- Tim Dettmers' blog — QLoRA, bitsandbytes

## Weekly plan

| Week | Topics | 🛠 Build |
|---|---|---|
| 49 | embeddings | embed a corpus |
| 50 | vector databases (Chroma/pgvector/Pinecone) | load + query a vector DB |
| 51 | semantic search | search your corpus |
| 52 | RAG fundamentals | design a RAG pipeline |
| 53 | build simple RAG | end-to-end RAG |
| 54 | evaluation | retrieval + generation eval dataset |
| 55 | fine-tuning | instruction-tune a small open model |
| 56 | LoRA | LoRA fine-tune |
| 57 | quantization (GPTQ/bitsandbytes/QLoRA) | quantize a model |
| 58 | inference optimization (KV cache, batching) | measure latency/throughput |
| 59–60 | **Capstone** | **Production RAG system** |

## Capstone (Weeks 59–60)
A **production-style RAG system**: retrieval + evaluation + logging + metrics, with tests and an
eval dataset. Portfolio projects #7 (fine-tuned LLM, from weeks 55–56) and #8 (this RAG system).
