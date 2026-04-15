#!/usr/bin/env bash
set -Eeuo pipefail

cd "$HOME/projects/spidernet-control-deck"

if ! command -v codex >/dev/null 2>&1; then
  echo "ERROR: codex CLI not found in PATH"
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "Usage: scripts/use_codex_mini_custom.sh \"your prompt here\""
  exit 1
fi

codex -m gpt-5.1-codex-mini "$*"
