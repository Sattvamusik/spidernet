#!/bin/bash
# 🕸 SpiderNet v5 — Secure Self-Healing System
set -euo pipefail

USER="$(whoami)"
BASE="$HOME/.spidernet"
SPN_BIN="$HOME/.local/bin"
LOGS="$BASE/logs"
BASHRC="$HOME/.bashrc"

echo "⚡ Installing SpiderNet for $USER ..."

mkdir -p "$BASE" "$LOGS" "$SPN_BIN"

# Clean bad aliases
sed -i '/alias spn clean/d' "$BASHRC" || true
sed -i '/spn-/d' "$BASHRC" || true

# Install deps
if ! dpkg -s python3-pyqt5 >/dev/null 2>&1; then
  echo "📦 Installing dependencies (may ask password)..."
  sudo apt update -y
  sudo apt install -y python3-pyqt5 zenity libnotify-bin xdg-utils
fi

# Main spn command
cat > "$SPN_BIN/spn" << 'EOS'
#!/bin/bash
BASE="$HOME/.spidernet"
LOGS="$BASE/logs"
mkdir -p "$LOGS"
case "$1" in
  cockpit)   nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 & echo "🌻 Cockpit started";;
  clean)     "$BASE/slo_clean.sh";;
  health)    "$BASE/hospital.sh";;
  trauma)    "$BASE/trauma_center.sh";;
  status)    pgrep -f "python.*cockpit.py" >/dev/null && echo "🟢 Cockpit running" || echo "🔴 Cockpit stopped";;
  *)         echo "Usage: spn [cockpit|clean|health|trauma|status]";;
esac
EOS
chmod +x "$SPN_BIN/spn"

# Safe aliases
cat >> "$BASHRC" << 'EOB'
export PATH="$HOME/.local/bin:$PATH"
alias spn-cockpit='spn cockpit'
alias spn-clean='spn clean'
alias spn-health='spn health'
alias spn-trauma='spn trauma'

# Auto-start cockpit
(spawn() { sleep 5 && spn cockpit; }; spawn &) 2>/dev/null &
EOB

echo "✅ SPIDERNET IS ALIVE — Installed successfully."
echo "Run: source ~/.bashrc && spn cockpit"
