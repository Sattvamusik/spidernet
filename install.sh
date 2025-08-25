#!/bin/bash
# 🌟 SpiderNet Secure Installer (v5)

set -euo pipefail

USER="$(whoami)"
BASE="$HOME/.spidernet"
SPN_BIN="$HOME/.local/bin"
BASHRC="$HOME/.bashrc"
LOGS="$BASE/logs"

echo "⚡ Installing SpiderNet Secure v5 for $USER ..."

# --- Setup dirs ---
mkdir -p "$BASE" "$SPN_BIN" "$LOGS"

# --- Clean old aliases ---
sed -i '/alias spn/d' "$BASHRC" || true
rm -f "$SPN_BIN/spn" || true

# --- Install deps ---
if ! command -v python3 >/dev/null; then
  echo "❌ Python3 missing. Please install manually."
  exit 1
fi
if ! python3 -c "import PyQt5" 2>/dev/null; then
  echo "📦 Installing PyQt5 (may ask for password)..."
  sudo apt update -y && sudo apt install -y python3-pyqt5
fi

# --- Create spn launcher ---
cat > "$SPN_BIN/spn" << 'EOS'
#!/bin/bash
BASE="$HOME/.spidernet"
case "$1" in
  cockpit) nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 & echo "🌻 Cockpit started" ;;
  clean)   echo "🧹 Cleaner placeholder" ;;
  health)  echo "🏥 Hospital diagnostics placeholder" ;;
  trauma)  echo "🚑 Trauma repairs placeholder" ;;
  *) echo "Usage: spn {cockpit|clean|health|trauma}" ;;
esac
EOS

chmod +x "$SPN_BIN/spn"

# --- Update PATH & auto-launch cockpit ---
if ! grep -q "spn cockpit" "$BASHRC"; then
  cat >> "$BASHRC" << 'EOB'
export PATH="$HOME/.local/bin:$PATH"
(spawn() { sleep 5 && spn cockpit; }; spawn &) 2>/dev/null &
EOB
fi

echo "✅ SPIDERNET IS ALIVE — Installed successfully."
echo "Run: source ~/.bashrc && spn cockpit"
