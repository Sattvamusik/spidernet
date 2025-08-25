#!/bin/bash
# 🌟 SpiderNet Secure Installer (with auto-cleanup)
set -euo pipefail

USER="$(whoami)"
BASE="$HOME/.spidernet"
SPN_BIN="$HOME/.local/bin"
BASHRC="$HOME/.bashrc"

echo "⚡ Installing SpiderNet for $USER ..."

# --- Cleanup any bad old aliases ---
if grep -q "alias spn clean" "$BASHRC"; then
  sed -i '/alias spn clean/d' "$BASHRC"
  echo "🧹 Removed broken alias 'spn clean'"
fi

# --- Setup directories ---
mkdir -p "$BASE" "$SPN_BIN"

# --- Create spn launcher ---
cat > "$SPN_BIN/spn" << 'EOS'
#!/bin/bash
BASE="$HOME/.spidernet"
case "$1" in
  cockpit)   nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 & echo "🌻 Cockpit started" ;;
  clean)     "$BASE/slo_clean.sh" ;;
  health)    "$BASE/hospital.sh" ;;
  trauma)    "$BASE/trauma_center.sh" ;;
  status)    echo "🩺 SpiderNet is alive" ;;
  *)         echo "Usage: spn {cockpit|clean|health|trauma|status}" ;;
esac
EOS
chmod +x "$SPN_BIN/spn"

# --- Add PATH if missing ---
if ! grep -q ".local/bin" "$BASHRC"; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$BASHRC"
fi

echo "✅ SPIDERNET IS ALIVE — Installed successfully."
echo "Run: source ~/.bashrc && spn cockpit"
