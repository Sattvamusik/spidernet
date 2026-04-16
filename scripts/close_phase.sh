#!/usr/bin/env bash
set -euo pipefail

REPO="/home/sattv/projects/spidernet-control-deck"
cd "$REPO"

echo
echo "=== Refreshing handoff ==="
bash scripts/export_handoff.sh

echo
echo "=== Current repo state ==="
git log --oneline -8
echo
git status --short
echo

DEFAULT_MILESTONE="$(git log --pretty=%s | grep -v '^Handoff:' | head -n 1 || true)"
DEFAULT_MILESTONE="${DEFAULT_MILESTONE:-manual milestone}"

echo "Press Enter to accept the default milestone name."
echo "Do not type shell commands here."
read -rp "Milestone name for handoff commit [${DEFAULT_MILESTONE}]: " MILESTONE
MILESTONE="${MILESTONE:-$DEFAULT_MILESTONE}"

git add .handoff
git commit -m "Handoff: refresh after ${MILESTONE}"

echo
echo "Done."
echo "Next:"
echo "  cat /home/sattv/projects/spidernet-control-deck/.handoff/08-next-thread-prompt.txt"
echo "Then paste that into a new chat."
