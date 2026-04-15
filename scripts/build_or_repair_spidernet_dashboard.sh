#!/usr/bin/env bash
set -Eeuo pipefail
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
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

case "${PM}" in
  pnpm) pnpm install ;;
  yarn) yarn install ;;
  npm) npm install ;;
esac

case "${PM}" in
  pnpm) pnpm run lint && pnpm run build ;;
  yarn) yarn lint && yarn build ;;
  npm) npm run lint && npm run build ;;
esac

"${PROJECT_DIR}/scripts/open_spidernet_dashboard.sh"
