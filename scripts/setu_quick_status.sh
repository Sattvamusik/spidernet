#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

echo "=== SETU QUICK STATUS ==="
echo "root: $ROOT"
echo

echo "--- codex config ---"
sed -n '1,220p' "$HOME/.codex/config.toml" || true
echo

echo "--- architecture docs ---"
ls -1 docs/architecture || true
echo

echo "--- rul ---"
ls -1 rul || true
echo

echo "--- browser/app route ---"
curl -I http://127.0.0.1:3000/ || true
echo
curl -I http://127.0.0.1:3000/boards/input-data || true
