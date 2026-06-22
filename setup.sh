#!/usr/bin/env bash
# Bootstrap the AI-from-first-principles environment.
# Idempotent: safe to re-run.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> AI From First Principles — setup"

# 1. uv must be installed.
if ! command -v uv >/dev/null 2>&1; then
  echo "ERROR: 'uv' is not installed. Install it: https://docs.astral.sh/uv/getting-started/installation/"
  echo "  curl -LsSf https://astral.sh/uv/install.sh | sh"
  exit 1
fi
echo "==> uv: $(uv --version)"

# 2. Sync base dependencies (creates .venv).
echo "==> Installing base dependencies (numpy, matplotlib, pytest, jupyterlab)..."
uv sync

# 3. Register a Jupyter kernel for this project.
echo "==> Registering Jupyter kernel 'ai-ffp'..."
uv run python -m ipykernel install --user --name ai-ffp --display-name "AI From First Principles" >/dev/null 2>&1 || true

# 4. Smoke test.
echo "==> Verifying imports..."
uv run python -c "import numpy, matplotlib; print('numpy', numpy.__version__, '| matplotlib', matplotlib.__version__)"

cat <<'EOF'

==> Done. Next steps:

  uv run python track.py status     # where am I?
  uv run python track.py next       # what do I do next?
  uv run jupyter lab                # launch notebooks

  Start Week 1:
    uv run pytest phase1-math/week01-vectors-matrices/   # RED
    # implement phase1-math/week01-vectors-matrices/matrix_multiply.py
    uv run pytest phase1-math/week01-vectors-matrices/   # GREEN
    uv run python track.py done week01

  Install heavier phase deps only when you reach them, e.g.:
    uv sync --extra dl     # PyTorch (Phase 3+)
    uv sync --extra nlp    # transformers/datasets (Phase 4/5)

EOF
