#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
LOG=".codex/logs/setu_safe_${STAMP}.log"

echo "[INFO] Repo: $ROOT"
echo "[INFO] Log:  $LOG"

codex \
  --ask-for-approval never \
  --sandbox workspace-write \
  exec \
  "$(cat .codex/prompts/setu_build_prompt.txt)" \
  | tee "$LOG"

echo
echo "[DONE] Codex finished."
echo "[INFO] Review: $LOG"
