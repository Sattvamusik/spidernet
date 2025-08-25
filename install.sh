#!/bin/bash
# 🌻 SpiderNet Installer v2
set -euo pipefail

TARGET_USER="${SUDO_USER:-$USER}"
HOME_DIR="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
BASE="$HOME_DIR/.spidernet"
TOOLS="$BASE/tools"
ASSETS="$BASE/assets"

echo "=== 🌻 Installing SpiderNet Cockpit v2 for $TARGET_USER ==="

mkdir -p "$TOOLS" "$ASSETS"

grep -qxF 'alias spn="python3 $BASE/cockpit.py"' "$HOME_DIR/.bashrc" || echo 'alias spn="python3 $BASE/cockpit.py"' >> "$HOME_DIR/.bashrc"

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
cp "$(dirname "$0")/assets/sunflower.png" "$ICON_FILE"

echo "✅ Installation complete! Launch with: spn"
