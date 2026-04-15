#!/usr/bin/env bash
set -Eeuo pipefail
cd "$HOME/projects/spidernet-control-deck"

echo "=== LOCAL CODING STATUS ==="
scripts/spidernet-local-code-status.sh
echo
echo "=== ROOT ==="
curl -I http://127.0.0.1:3000/ || true
echo
echo "=== INPUT DATA ==="
curl -I http://127.0.0.1:3000/boards/input-data || true
