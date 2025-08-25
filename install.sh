#!/bin/bash
# 🌻 Install script for Linux - creates desktop shortcut
BASE="$HOME/SpiderNet"
mkdir -p "$BASE"
DESKTOP="$HOME/Desktop"
ICON="$BASE/assets/sunflower.png"
APP="$BASE/cockpit.py"

cat > "$DESKTOP/SpiderNet-Cockpit.desktop" <<EOL
[Desktop Entry]
Name=SpiderNet Cockpit
Exec=python3 $APP
Icon=$ICON
Type=Application
Terminal=false
EOL

chmod +x "$DESKTOP/SpiderNet-Cockpit.desktop"
echo "🌻 Cockpit shortcut created on Desktop."
