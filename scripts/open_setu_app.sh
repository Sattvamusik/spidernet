#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

URL="http://127.0.0.1:3000"

if ! curl -fsS "$URL" >/dev/null 2>&1; then
  echo "[INFO] Setu not running. Starting dev server..."
  nohup npm run dev >/tmp/setu_dev.log 2>&1 &
  sleep 10
fi

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
fi

echo "[OK] Setu app target: $URL"
