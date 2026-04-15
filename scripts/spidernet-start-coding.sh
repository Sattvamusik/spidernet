#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

echo "=== SPIDERNET START CODING ==="

echo
echo "=== STEP 1: OLLAMA ==="
if ! curl -fsS http://127.0.0.1:11434 >/dev/null 2>&1; then
  nohup ollama serve >/tmp/ollama_spidernet.log 2>&1 &
  sleep 8
fi
curl -fsS http://127.0.0.1:11434 >/dev/null
echo "ollama: UP"

echo
echo "=== STEP 2: MODEL CHECK ==="
ollama list | grep -q 'qwen2.5-coder:7b'
echo "model qwen2.5-coder:7b: READY"

echo
echo "=== STEP 3: NEXT DEV SERVER ==="
if ! curl -fsS http://127.0.0.1:3000/ >/dev/null 2>&1; then
  nohup npm run dev >/tmp/spidernet_dev.log 2>&1 &
  sleep 12
fi
curl -fsS http://127.0.0.1:3000/ >/dev/null
echo "next dev: UP"

echo
echo "=== STEP 4: STATUS ==="
echo "root route:"
curl -I -s http://127.0.0.1:3000/ | head -n 1
echo "input-data route:"
curl -I -s http://127.0.0.1:3000/boards/input-data | head -n 1

echo
echo "=== STEP 5: START AIDER ==="
export OLLAMA_API_BASE=http://127.0.0.1:11434
exec .venv-tools/bin/aider --model ollama_chat/qwen2.5-coder:7b
