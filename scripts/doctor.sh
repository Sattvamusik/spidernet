#!/usr/bin/env bash
set -euo pipefail

echo "SpiderNet Doctor"
echo "PWD: $(pwd)"
echo

echo "[1] Folder check"
for p in docs plans logs tests scripts src artifacts; do
  if [[ -d "$p" ]]; then
    echo "  OK  $p/"
  else
    echo "  MISS $p/"
  fi
done

echo
echo "[2] Core file check"
for f in AGENTS.md README.md .gitignore .env.example .editorconfig .gitattributes docs/architecture.md docs/runbook.md docs/spidernet-operating-rules.md plans/phase-01.md plans/ftd.md logs/worklog.md; do
  if [[ -f "$f" ]]; then
    echo "  OK  $f"
  else
    echo "  MISS $f"
  fi
done

echo
echo "[3] Git status"
if command -v git >/dev/null 2>&1; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git status --short
  else
    echo "  Git not initialized yet."
  fi
else
  echo "  Git not installed."
fi
