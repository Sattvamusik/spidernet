#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

printf '\033]0;SETU-DESKTOP-CODEX\a'

codex --profile heavy_build exec "$(cat .codex/prompts/setu_desktop_app_v1.txt)"
