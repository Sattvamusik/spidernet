#!/usr/bin/env bash
set -euo pipefail

REPO="/home/sattv/projects/spidernet-control-deck"
cd "$REPO"

echo "Use the pasted handoff contents below as source of truth."
echo "Do not restart discovery."
echo "Do not reopen settled decisions."
echo "Treat committed + handoff-refreshed milestones as frozen unless explicitly reopened."
echo
echo "===== .handoff/manifest.json ====="
cat .handoff/manifest.json
echo
echo "===== .handoff/00-current-state.md ====="
cat .handoff/00-current-state.md
echo
echo "===== .handoff/01-decisions.md ====="
cat .handoff/01-decisions.md
echo
echo "===== .handoff/02-open-loops.md ====="
cat .handoff/02-open-loops.md
echo
echo "===== .handoff/05-repo-facts.txt ====="
cat .handoff/05-repo-facts.txt
echo
echo "===== git log --oneline -20 ====="
git log --oneline -20
echo
echo "===== REQUEST ====="
echo "Now, using only the pasted handoff + git data above:"
echo "1. summarize current verified state"
echo "2. list locked decisions"
echo "3. list open loops"
echo "4. identify the smallest next milestone"
echo "5. do not reopen frozen milestones"
