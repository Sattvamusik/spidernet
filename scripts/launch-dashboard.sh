#!/usr/bin/env bash
# launch-dashboard.sh
# Clickable desktop launcher runner for SETU/DRISHTI deck dashboard.
# - If port 3000 /api/health already responds, skip to opening the browser.
# - Otherwise, invoke DRISHTI's start-app.sh (absolute path, reference-only)
#   in the background via nohup, then poll /api/health up to ~60s.
# - Finally, open the dashboard via wslview / xdg-open / printed fallback.

set -euo pipefail

APP_URL="http://127.0.0.1:3000"
HEALTH_URL="$APP_URL/api/health"
START_SCRIPT="/home/sattv/SpiderNet_Control/08_HIVE/DRISHTI/launcher/scripts/start-app.sh"
LOG_DIR="/home/sattv/SpiderNet_Local/logs"
LOG_FILE="$LOG_DIR/launch-dashboard.log"

open_browser() {
  if command -v wslview >/dev/null 2>&1; then
    wslview "$APP_URL" >/dev/null 2>&1 || true
    return 0
  fi
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$APP_URL" >/dev/null 2>&1 || true
    return 0
  fi
  echo "[launch-dashboard] No browser opener found. Please open: $APP_URL"
}

# Fast path: already healthy.
if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
  echo "[launch-dashboard] Dashboard already healthy at $HEALTH_URL — opening browser."
  open_browser
  exit 0
fi

# Otherwise, try to start it via the DRISHTI start-app.sh (reference-only).
if [ ! -x "$START_SCRIPT" ]; then
  echo "[launch-dashboard] ERROR: start script not executable at $START_SCRIPT" >&2
  exit 1
fi

mkdir -p "$LOG_DIR"

echo "[launch-dashboard] Starting app via $START_SCRIPT (log: $LOG_FILE)"
nohup "$START_SCRIPT" >>"$LOG_FILE" 2>&1 &
disown || true

# Poll /api/health every 2s up to 30 tries (~60s).
for attempt in $(seq 1 30); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "[launch-dashboard] Healthy after $((attempt * 2))s — opening browser."
    open_browser
    exit 0
  fi
  sleep 2
done

echo "[launch-dashboard] ERROR: $HEALTH_URL never became healthy within ~60s. See $LOG_FILE." >&2
exit 1
