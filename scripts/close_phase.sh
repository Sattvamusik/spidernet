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
read -rp "Milestone name for handoff commit: " MILESTONE

if [ -z "${MILESTONE}" ]; then
  echo "Milestone name cannot be empty."
  exit 1
fi

git add .handoff
git commit -m "Handoff: refresh after ${MILESTONE}"

echo
echo "Done."
echo "Next: open a new chat and paste .handoff/08-next-thread-prompt.txt"
