#!/usr/bin/env bash
set -euo pipefail

REPO="/home/sattv/projects/spidernet-control-deck"
cd "$REPO"

echo
echo "=== Refreshing handoff ==="
bash scripts/export_handoff.sh

echo
echo "=== Current repo state ==="
git log --oneline -6
echo
git status --short
echo

DEFAULT_MILESTONE="$(git log -1 --pretty=%s)"
read -rp "Milestone name for handoff commit [${DEFAULT_MILESTONE}]: " MILESTONE
MILESTONE="${MILESTONE:-$DEFAULT_MILESTONE}"

git add .handoff
git commit -m "Handoff: refresh after ${MILESTONE}"

echo
echo "Done."
echo "Next: open a new chat and paste .handoff/08-next-thread-prompt.txt"
