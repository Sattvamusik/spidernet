#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$HOME/projects/spidernet-control-deck"
RUNTIME_DIR="$PROJECT_DIR/artifacts/runtime/spidernet"
LOG_DIR="$PROJECT_DIR/artifacts/runtime/logs"
PID_FILE="$LOG_DIR/dev.pid"
OUT_LOG="$LOG_DIR/dev.out.log"
ERR_LOG="$LOG_DIR/dev.err.log"

echo "== SpiderNet clean reset and run =="

cd "$PROJECT_DIR"

mkdir -p "$LOG_DIR"

echo "-- killing old Next.js/node processes on 3000/3001"
kill -9 $(lsof -t -i:3000) 2>/dev/null || true
kill -9 $(lsof -t -i:3001) 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*spidernet-control-deck" 2>/dev/null || true

echo "-- resetting runtime folder"
rm -rf "$RUNTIME_DIR"
mkdir -p "$RUNTIME_DIR"/{packets,vaults,registries,config,ledger}

echo "[]" > "$RUNTIME_DIR/packets/intake.json"
echo "[]" > "$RUNTIME_DIR/packets/research.json"
echo "[]" > "$RUNTIME_DIR/packets/execution.json"
echo "[]" > "$RUNTIME_DIR/packets/validation.json"
echo "[]" > "$RUNTIME_DIR/packets/approval.json"
echo "[]" > "$RUNTIME_DIR/packets/pass.json"

echo "{}" > "$RUNTIME_DIR/vaults/index.json"

# IMPORTANT: these must be arrays for current code paths
echo "[]" > "$RUNTIME_DIR/registries/scores.json"
echo "[]" > "$RUNTIME_DIR/registries/wrappers.json"
echo "[]" > "$RUNTIME_DIR/registries/skills.json"

echo "[]" > "$RUNTIME_DIR/ledger/events.json"

cat > "$RUNTIME_DIR/config/ollama.json" <<'JSON'
{
  "enabled": false,
  "baseUrl": "http://127.0.0.1:11434",
  "model": "",
  "handshakeStatus": "not_configured"
}
JSON

echo "-- ensuring dependency install exists"
if [ ! -d node_modules ]; then
  npm install
fi

echo "-- starting Next.js in background"
nohup npm run dev >"$OUT_LOG" 2>"$ERR_LOG" &
echo $! > "$PID_FILE"

echo "-- waiting for server"
for i in {1..20}; do
  if curl -sSf http://127.0.0.1:3000 >/dev/null 2>&1; then
    echo "SUCCESS: dashboard is live at http://127.0.0.1:3000"
    echo "PID: $(cat "$PID_FILE")"
    echo "OUT LOG: $OUT_LOG"
    echo "ERR LOG: $ERR_LOG"
    explorer.exe http://localhost:3000 >/dev/null 2>&1 || true
    exit 0
  fi
  sleep 1
done

echo "FAILED: dashboard did not come up on port 3000"
echo "Check logs:"
echo "  $OUT_LOG"
echo "  $ERR_LOG"
exit 1
