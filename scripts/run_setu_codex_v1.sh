#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

LOCK_DIR="/tmp/setu_codex_v1.lock"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "[REJECTED] Another Setu Codex run is already active."
  echo "[INFO] If the lock is stale, remove it manually:"
  echo "       rm -rf $LOCK_DIR"
  exit 1
fi

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

printf '\033]0;SETU-CODEX\a'

codex --profile heavy_build exec "Resume from where we ended in this repo.

First:
- inspect current repo state
- inspect recent diffs and changed files
- inspect relevant logs, architecture docs, FTD, and Setu-related scaffolding
- infer the last completed verified milestone
- continue from there, not from scratch

Current mission:
Continue building Setu under SpiderNet law.

Rules:
- Setu is the bridge deck
- Saarthi is the manager
- Hanuman ji is head of all agents
- Input Data is the main intake point
- preserve the white Setu UI unless explicitly approved otherwise
- do not touch unrelated files
- separate inferred from verified
- never claim verified unless checks actually pass
- keep logs useful and product-relevant
- freeze, mirror, recovery, Brain, FTD, and architecture maps matter
- if another identical run is active, reject duplicate execution

Before making changes:
- state the last verified milestone
- state touched files
- state the smallest justified next step

After changes:
- run relevant checks
- report only what actually passed
- clearly state what remains."
