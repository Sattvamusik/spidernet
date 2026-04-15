#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

echo "=== SETU RECOVERY STATUS ==="
echo
echo "--- freeze ---"
find artifacts/freeze -maxdepth 2 -type f | sort || true
echo
echo "--- recovery ---"
find artifacts/recovery -maxdepth 2 -type f | sort || true
echo
echo "--- mission ---"
ls -l artifacts/missions/current-mission.json || true
