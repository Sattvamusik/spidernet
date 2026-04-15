#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

export OLLAMA_API_BASE="${OLLAMA_API_BASE:-http://127.0.0.1:11434}"

if [ ! -x ".venv-tools/bin/aider" ]; then
  echo "[ERROR] .venv-tools/bin/aider not found"
  exit 1
fi

echo "[INFO] Repo: $ROOT"
echo "[INFO] OLLAMA_API_BASE: $OLLAMA_API_BASE"
echo "[INFO] Starting local SETU session with Aider"

.venv-tools/bin/aider \
  --model ollama_chat/qwen2.5-coder:7b \
  src/app/api/spidernet/intake/route.ts \
  src/lib/spidernet/coding-flow.ts \
  src/lib/spidernet/harness.ts \
  src/lib/spidernet/socrates.ts \
  src/lib/spidernet/chanakya.ts \
  src/lib/spidernet/brain-manager.ts \
  src/lib/spidernet/ollama-manager.ts \
  src/lib/spidernet/storage.ts \
  src/lib/spidernet/data.ts \
  scripts/spidernet-coding-launcher.sh \
  --message-file .aider/prompts/setu_start_prompt.txt
