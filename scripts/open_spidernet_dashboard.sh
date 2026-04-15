#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="${PROJECT_DIR}/logs"
mkdir -p "${LOG_DIR}"

PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

cd "${PROJECT_DIR}"

pick_pm() {
  if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
    echo "pnpm"
    return
  fi
  if [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then
    echo "yarn"
    return
  fi
  if command -v npm >/dev/null 2>&1; then
    echo "npm"
    return
  fi
  echo ""
}

PM="$(pick_pm)"
[ -n "${PM}" ] || { echo "No package manager found. Install npm, pnpm, or yarn."; exit 1; }

if [ ! -f package.json ]; then
  echo "package.json not found in ${PROJECT_DIR}"
  exit 1
fi

if [ ! -d node_modules ]; then
  case "${PM}" in
    pnpm) pnpm install ;;
    yarn) yarn install ;;
    npm) npm install ;;
  esac
fi

if pgrep -f "next dev.*${PORT}" >/dev/null 2>&1 || pgrep -f "vite.*${PORT}" >/dev/null 2>&1; then
  URL="http://127.0.0.1:${PORT}"
  command -v xdg-open >/dev/null 2>&1 && xdg-open "${URL}" >/dev/null 2>&1 || true
  echo "SpiderNet Dashboard already running at ${URL}"
  exit 0
fi

if grep -q "\"dev\"" package.json 2>/dev/null; then
  case "${PM}" in
    pnpm) nohup pnpm run dev -- --hostname "${HOST}" --port "${PORT}" > "${LOG_DIR}/dashboard_runtime.log" 2>&1 & ;;
    yarn) nohup yarn dev --host "${HOST}" --port "${PORT}" > "${LOG_DIR}/dashboard_runtime.log" 2>&1 & ;;
    npm) nohup npm run dev -- --hostname "${HOST}" --port "${PORT}" > "${LOG_DIR}/dashboard_runtime.log" 2>&1 & ;;
  esac
elif grep -q "\"start\"" package.json 2>/dev/null; then
  case "${PM}" in
    pnpm) nohup pnpm start -- --hostname "${HOST}" --port "${PORT}" > "${LOG_DIR}/dashboard_runtime.log" 2>&1 & ;;
    yarn) nohup yarn start --host "${HOST}" --port "${PORT}" > "${LOG_DIR}/dashboard_runtime.log" 2>&1 & ;;
    npm) nohup npm start -- --hostname "${HOST}" --port "${PORT}" > "${LOG_DIR}/dashboard_runtime.log" 2>&1 & ;;
  esac
else
  echo "No dev/start script found in package.json"
  exit 1
fi

sleep 8
URL="http://127.0.0.1:${PORT}"
command -v xdg-open >/dev/null 2>&1 && xdg-open "${URL}" >/dev/null 2>&1 || true
echo "SpiderNet Dashboard started at ${URL} using ${PM}"
