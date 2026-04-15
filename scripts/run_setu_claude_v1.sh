#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

LOCK_DIR="/tmp/setu_claude_v1.lock"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "[REJECTED] Another Setu Claude run is already active."
  echo "[INFO] If the lock is stale, remove it manually:"
  echo "       rm -rf $LOCK_DIR"
  exit 1
fi

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

export PATH="$HOME/.local/bin:$PATH"
hash -r

printf '\033]0;SETU-CLAUDE\a'

claude
