#!/usr/bin/env bash
set -euo pipefail
cd /home/sattv/projects/spidernet-control-deck || exit 1
git status --short
git log --oneline -8
npm run lint
npx tsc --noEmit
npm run build
