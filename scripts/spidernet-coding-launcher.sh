#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || printf '%s' "$ROOT")"
cd "$ROOT"

show_header() {
  echo
  echo "==============================================="
  echo " SPIDERNET CODING LAUNCHER — PHASE 1.5"
  echo " root: $ROOT"
  echo "==============================================="
  echo
}

resolve_aider_bin() {
  if [ -x ".venv-tools/bin/aider" ]; then
    printf '%s\n' ".venv-tools/bin/aider"
    return 0
  fi

  command -v aider 2>/dev/null || true
}

show_status() {
  show_header

  echo "=== CORE FILES ==="
  ls -l \
    src/lib/spidernet/brain-manager.ts \
    src/lib/spidernet/chanakya.ts \
    src/lib/spidernet/coding-flow.ts \
    src/lib/spidernet/harness.ts \
    src/lib/spidernet/ollama-manager.ts \
    src/lib/spidernet/socrates.ts 2>/dev/null || true
  echo

  echo "=== TOOL AVAILABILITY ==="
  command -v codex >/dev/null 2>&1 && echo "codex: AVAILABLE" || echo "codex: MISSING"
  command -v ollama >/dev/null 2>&1 && echo "ollama: AVAILABLE" || echo "ollama: MISSING"
  command -v ollama >/dev/null 2>&1 && ollama --version || true
  command -v node >/dev/null 2>&1 && echo "node: AVAILABLE" || echo "node: MISSING"
  AIDER_BIN="$(resolve_aider_bin)"
  if [ -n "$AIDER_BIN" ]; then
    echo "aider: AVAILABLE ($AIDER_BIN)"
    "$AIDER_BIN" --version || true
  else
    echo "aider: MISSING"
  fi
  echo

  echo "=== OLLAMA ENDPOINT ==="
  curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1 \
    && echo "ollama endpoint: UP" \
    || echo "ollama endpoint: DOWN"
  echo

  echo "=== LOCAL MODELS ==="
  command -v ollama >/dev/null 2>&1 && ollama list || true
  echo

  echo "=== APP ROUTES ==="
  pgrep -f "next dev" >/dev/null 2>&1 && echo "next dev: UP" || echo "next dev: DOWN"
  echo

  echo "=== COMMANDS ==="
  echo "scripts/spidernet-coding-launcher.sh status"
  echo "scripts/spidernet-coding-launcher.sh check"
  echo "scripts/spidernet-coding-launcher.sh dev"
  echo "scripts/spidernet-coding-launcher.sh intake-check"
  echo "scripts/spidernet-coding-launcher.sh start-coding"
  echo "scripts/spidernet-coding-launcher.sh codex"
  echo "scripts/spidernet-coding-launcher.sh ollama"
  echo
}

check_all() {
  show_status
}

run_dev() {
  cd "$ROOT"
  npm run dev
}

run_intake_check() {
  cd "$ROOT"
  ./scripts/spidernet-phase1-check.sh
}

run_codex() {
  cd "$ROOT"
  codex
}

run_ollama() {
  cd "$ROOT"
  ollama run qwen2.5-coder:7b
}

start_coding() {
  cd "$ROOT"
  show_header
  AIDER_BIN="$(resolve_aider_bin)"
  if [ -n "$AIDER_BIN" ]; then
    exec "$AIDER_BIN" --model ollama_chat/qwen2.5-coder:7b
  fi
  exec aider --model ollama_chat/qwen2.5-coder:7b
}

cmd="${1:-status}"

case "$cmd" in
  status) show_status ;;
  check) check_all ;;
  dev) run_dev ;;
  intake-check) run_intake_check ;;
  start-coding) start_coding ;;
  codex) run_codex ;;
  ollama) run_ollama ;;
  *)
    echo "Unknown command: $cmd" >&2
    exit 1
    ;;
esac
