#!/bin/bash
# 🌻 SpiderNet Installer v2
set -euo pipefail

TARGET_USER="${SUDO_USER:-$USER}"
HOME_DIR="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
BASE="$HOME_DIR/.spidernet"
TOOLS="$BASE/tools"
ASSETS="$BASE/assets"

echo "=== 🌻 Installing SpiderNet Cockpit v2 for $TARGET_USER ==="

# Folders
mkdir -p "$TOOLS" "$ASSETS"

# Fix alias warnings
grep -qxF 'alias spn="python3 $BASE/cockpit.py"' "$HOME_DIR/.bashrc" || \
echo 'alias spn="python3 $BASE/cockpit.py"' >> "$HOME_DIR/.bashrc"

# Install desktop shortcut
DESKTOP_FILE="$HOME_DIR/Desktop/SpiderNet.desktop"
ICON_FILE="$ASSETS/sunflower.png"

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=SpiderNet 🌻
Exec=python3 $BASE/cockpit.py
Icon=$ICON_FILE
Terminal=false
EOF

chmod +x "$DESKTOP_FILE"

# Copy icon
cp "$(dirname "$0")/assets/sunflower.png" "$ICON_FILE"

echo "✅ Installation complete! Launch with: spn"
#!/bin/bash
# 🌐 SpiderNet Secure Installer
# Always fetches the latest Cockpit + Agents + Docs from GitHub

set -euo pipefail

USER="$(whoami)"
HOME_DIR="/home/$USER"
BASE="$HOME_DIR/.spidernet"
SPN_BIN="$HOME_DIR/.local/bin"
BASHRC="$HOME_DIR/.bashrc"
LOGS="$BASE/logs"

REPO_RAW="https://raw.githubusercontent.com/sattvamusik/spidernet/main"

echo "⚡ Installing SpiderNet for $USER ..."

# --- 1. Create directories ---
mkdir -p "$BASE" "$LOGS" "$SPN_BIN"

# --- 2. Clean broken aliases (fixes 'alias spn clean' error) ---
sed -i '/alias spn clean/d' "$BASHRC" || true
sed -i '/spn-/d' "$BASHRC" || true

# --- 3. Create spn command ---
cat > "$SPN_BIN/spn" << 'EOS'
#!/bin/bash
BASE="$HOME/.spidernet"
case "$1" in
  cockpit)   nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 & echo "🌻 Cockpit started" ;;
  clean)     "$BASE/slo_clean.sh" ;;
  health)    "$BASE/hospital.sh" ;;
  trauma)    "$BASE/trauma_center.sh" ;;
  status)    echo "🕸️ SpiderNet status:"; pgrep -f cockpit.py >/dev/null && echo "✅ Cockpit running" || echo "❌ Cockpit stopped" ;;
  *)         echo "Usage: spn {cockpit|clean|health|trauma|status}" ;;
esac
EOS
chmod +x "$SPN_BIN/spn"

# --- 4. Add PATH + safe aliases ---
if ! grep -q "spidernet" "$BASHRC"; then
  cat >> "$BASHRC" << 'EOB'
export PATH="$HOME/.local/bin:$PATH"
alias spn-cockpit='spn cockpit'
alias spn-clean='spn clean'
alias spn-health='spn health'
alias spn-trauma='spn trauma'
EOB
fi

# --- 5. Download latest files from GitHub ---
for file in cockpit.py PROJECTS.md IDEAS.md reset.sh update.sh; do
  echo "📥 Fetching $file ..."
  curl -fsSL "$REPO_RAW/$file" -o "$BASE/$file"
done

# --- 6. Install Python deps if missing ---
if ! python3 -c "import PyQt5" >/dev/null 2>&1; then
  echo "📦 Installing PyQt5 (requires sudo, enter password if asked)..."
  sudo apt update -y
  sudo apt install -y python3-pyqt5
fi

# --- 7. Auto-start Cockpit on login ---
if ! grep -q "spn cockpit" "$BASHRC"; then
  cat >> "$BASHRC" << 'EOL'
# Auto-launch SpiderNet Cockpit
(spawn() { sleep 5 && spn cockpit; }; spawn &) 2>/dev/null &
EOL
fi

echo "✅ SPIDERNET IS ALIVE — Installed successfully."
echo "👉 Run: source ~/.bashrc && spn cockpit"
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
