#!/usr/bin/env bash
set -Eeuo pipefail

cd "$HOME/projects/spidernet-control-deck"

echo "=== TARGETED TSC ==="
npx tsc --noEmit --pretty false

echo
echo "=== TARGETED ESLINT ==="
npx eslint \
  src/lib/spidernet/harness.ts \
  src/lib/spidernet/socrates.ts \
  src/lib/spidernet/chanakya.ts \
  src/lib/spidernet/brain-manager.ts \
  src/lib/spidernet/ollama-manager.ts \
  src/lib/spidernet/coding-flow.ts

echo
echo "=== FULL BUILD ==="
npm run build

echo
echo "PHASE1_CHECK_OK"
