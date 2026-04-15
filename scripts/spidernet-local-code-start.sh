#!/usr/bin/env bash
set -Eeuo pipefail
cd "$HOME/projects/spidernet-control-deck"

if ! curl -fsS http://127.0.0.1:11434 >/dev/null 2>&1; then
  nohup ollama serve >/tmp/ollama_spidernet.log 2>&1 &
  sleep 8
fi

export OLLAMA_API_BASE=http://127.0.0.1:11434
exec .venv-tools/bin/aider --model ollama_chat/qwen2.5-coder:7b
