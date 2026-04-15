#!/usr/bin/env bash
set -Eeuo pipefail

cd "$HOME/projects/spidernet-control-deck"

echo "=== CORE FILES ==="
ls -la \
  src/lib/spidernet/harness.ts \
  src/lib/spidernet/socrates.ts \
  src/lib/spidernet/chanakya.ts \
  src/lib/spidernet/brain-manager.ts \
  src/lib/spidernet/ollama-manager.ts \
  src/lib/spidernet/coding-flow.ts

echo
echo "=== PHASE 1 INVENTORY ==="
cat artifacts/runtime/spidernet/inventory/spidernet_phase1_inventory.md
