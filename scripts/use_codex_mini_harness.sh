#!/usr/bin/env bash
set -Eeuo pipefail

cd "$HOME/projects/spidernet-control-deck"

PROMPT_FILE="prompts/codex/harness_layer_prompt.md"

if ! command -v codex >/dev/null 2>&1; then
  echo "ERROR: codex CLI not found in PATH"
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "ERROR: prompt file not found: $PROMPT_FILE"
  exit 1
fi

exec codex "$(cat "$PROMPT_FILE")"
