#!/usr/bin/env bash
set -Eeuo pipefail
cd "$HOME/projects/spidernet-control-deck"

echo "=== LOCAL CODING STATUS ==="
echo "ollama: $(command -v ollama || echo MISSING)"
ollama --version || true
echo
if curl -fsS http://127.0.0.1:11434 >/dev/null 2>&1; then
  echo "ollama endpoint: UP"
else
  echo "ollama endpoint: DOWN"
fi
echo
if [ -x ".venv-tools/bin/aider" ]; then
  echo "aider: AVAILABLE"
  .venv-tools/bin/aider --version || true
else
  echo "aider: MISSING"
fi
echo
echo "models:"
ollama list || true
