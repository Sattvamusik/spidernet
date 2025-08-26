#!/bin/bash
set -e
INSTALL_DIR="$HOME/SpiderNet"
ZIP="$INSTALL_DIR/spidernet_secure.zip"

echo "🌻 Installing SpiderNet..."
mkdir -p "$INSTALL_DIR"

curl -fsSL https://github.com/Sattvamusik/spidernet/releases/latest/download/spidernet_secure.zip -o "$ZIP"
unzip -o "$ZIP" -d "$INSTALL_DIR"

sudo apt update -y && sudo apt install -y python3-pyqt5 python3-pil python3-tk

echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> ~/.bashrc
echo '(sleep 5 && python3 $HOME/SpiderNet/cockpit.py &)' >> ~/.bashrc

echo "✅ Installed. Run: python3 ~/SpiderNet/cockpit.py"
name: Build & Release SpiderNet

on:
  push:
    tags:
      - "v*.*"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Prepare ZIP
        run: |
          mkdir -p dist
          zip -r dist/spidernet_secure.zip . -x "*.git*" ".github/*"

      - name: Upload Release Assets
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/spidernet_secure.zip
            install.sh
            install.ps1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
#!/bin/bash
set -euo pipefail

USER=$(whoami)
HOME_DIR="/home/$USER"
INSTALL_DIR="$HOME_DIR/SpiderNet"
SPN_BIN="$HOME_DIR/.local/bin"

echo "=== 🌻 Installing SpiderNet for $USER ==="

# Download latest release ZIP
ZIP_URL=$(curl -s https://api.github.com/repos/Sattvamusik/spidernet/releases/latest \
  | grep "browser_download_url" \
  | grep "spidernet_secure.zip" \
  | cut -d '"' -f 4)

if [ -z "$ZIP_URL" ]; then
  echo "❌ Could not find spidernet_secure.zip in the latest release!"
  exit 1
fi

TMP="/tmp/spidernet_secure.zip"
curl -L -o "$TMP" "$ZIP_URL"
unzip -o "$TMP" -d "$INSTALL_DIR"

# Create spn launcher
cat > "$SPN_BIN/spn" << 'EOF'
#!/bin/bash
BASE="$HOME/SpiderNet"
case "$1" in
  cockpit)  nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 & echo "🌻 Cockpit started" ;;
  clean)    bash "$BASE/cleaner.sh" ;;
  health)   bash "$BASE/hospital.sh" ;;
  trauma)   bash "$BASE/trauma.sh" ;;
  sync)     python3 "$BASE/agents/SpiderSync/spidersync.py" ;;
  *)        echo "Usage: spn [cockpit|clean|health|trauma|sync]" ;;
esac
EOF
chmod +x "$SPN_BIN/spn"

# Desktop shortcut
cat > "$HOME_DIR/Desktop/spidernet.desktop" << EOL
[Desktop Entry]
Name=SpiderNet Cockpit
Comment=Self-Healing Dashboard
Exec=spn cockpit
Icon=$INSTALL_DIR/assets/sunflower.png
Terminal=false
Type=Application
Categories=Utility;
EOL
chmod +x "$HOME_DIR/Desktop/spidernet.desktop"

echo "✅ Install complete! Run: spn cockpit"
#!/bin/bash
set -euo pipefail

USER=$(whoami)
HOME_DIR="/home/$USER"
INSTALL_DIR="$HOME_DIR/SpiderNet"
SPN_BIN="$HOME_DIR/.local/bin"

echo "=== 🌻 Installing SpiderNet for $USER ==="

# 1. Download latest release ZIP
ZIP_URL=$(curl -s https://api.github.com/repos/Sattvamusik/spidernet/releases/latest \
  | grep "browser_download_url" | grep "spidernet_secure.zip" | cut -d '"' -f 4)

if [ -z "$ZIP_URL" ]; then
  echo "❌ Could not find spidernet_secure.zip in latest release"
  exit 1
fi

curl -L -o /tmp/spidernet_secure.zip "$ZIP_URL"
rm -rf "$INSTALL_DIR"
unzip /tmp/spidernet_secure.zip -d "$INSTALL_DIR"

# 2. Create spn launcher
mkdir -p "$SPN_BIN"
cat > "$SPN_BIN/spn" <<'EOF'
#!/bin/bash
BASE="$HOME/SpiderNet"
case "$1" in
  cockpit) python3 "$BASE/cockpit.py" ;;
  hospital) bash "$BASE/agents/hospital.sh" ;;
  trauma) bash "$BASE/agents/trauma.sh" ;;
  clean) bash "$BASE/agents/cleaner.sh" ;;
  sync) python3 "$BASE/agents/spidersync.py" ;;
  *) echo "Usage: spn [cockpit|hospital|trauma|clean|sync]" ;;
esac
EOF
chmod +x "$SPN_BIN/spn"

# 3. Add PATH if missing
grep -q "$SPN_BIN" ~/.bashrc || echo "export PATH=\"$SPN_BIN:\$PATH\"" >> ~/.bashrc

echo "✅ Install complete! Run: spn cockpit"
#!/bin/bash
set -euo pipefail

USER=$(whoami)
HOME_DIR="/home/$USER"
INSTALL_DIR="$HOME_DIR/SpiderNet"

echo "=== 🌻 Installing SpiderNet (Linux/macOS) ==="

# Download latest release ZIP
ZIP_URL=$(curl -s https://api.github.com/repos/Sattvamusik/spidernet/releases/latest \
  | grep "browser_download_url" \
  | grep "spidernet_secure.zip" \
  | cut -d '"' -f 4)

if [ -z "$ZIP_URL" ]; then
  echo "❌ Could not find spidernet_secure.zip in the latest release!"
  exit 1
fi

TMP_ZIP="/tmp/spidernet_secure.zip"
curl -L -o "$TMP_ZIP" "$ZIP_URL"
mkdir -p "$INSTALL_DIR"
unzip -o "$TMP_ZIP" -d "$INSTALL_DIR"

# Add launcher
mkdir -p "$HOME_DIR/.local/bin"
cat > "$HOME_DIR/.local/bin/spn" <<'EOF'
#!/bin/bash
python3 ~/SpiderNet/cockpit.py
EOF
chmod +x "$HOME_DIR/.local/bin/spn"

echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME_DIR/.bashrc"

echo "✅ Install complete! Run: spn"
ZIP_URL=$(curl -s https://api.github.com/repos/Sattvamusik/spidernet/releases/latest \
  | grep "browser_download_url" \
  | grep "spidernet_secure.zip" \
  | cut -d '"' -f 4)

curl -L "$ZIP_URL" -o /tmp/spidernet_secure.zip
unzip -o /tmp/spidernet_secure.zip -d "$BASE"
#!/bin/bash
# 🌻 SpiderNet Installer (Linux/macOS)
# Usage: curl -fsSL https://github.com/Sattvamusik/spidernet/releases/latest/download/install.sh | bash
set -euo pipefail

USER=$(whoami)
HOME_DIR="/home/$USER"
INSTALL_DIR="$HOME_DIR/SpiderNet"
SPN_BIN="$HOME_DIR/.local/bin"

echo "=== 🕸️ Installing SpiderNet for $USER ==="

mkdir -p "$INSTALL_DIR" "$SPN_BIN"

# --- 1. Download latest release asset ---
ZIP_URL=$(curl -s https://api.github.com/repos/Sattvamusik/spidernet/releases/latest \
  | grep "browser_download_url" \
  | grep "spidernet_secure.zip" \
  | cut -d '"' -f 4)

if [ -z "$ZIP_URL" ]; then
  echo "❌ Could not find spidernet_secure.zip in the latest release!"
  exit 1
fi

curl -L -o /tmp/spidernet_secure.zip "$ZIP_URL"
unzip -o /tmp/spidernet_secure.zip -d "$INSTALL_DIR"

# --- 2. Create launcher ---
cat > "$SPN_BIN/spn" << 'EOF'
#!/bin/bash
BASE="$HOME/SpiderNet"
case "$1" in
  cockpit) python3 "$BASE/cockpit.py" ;;
  hospital) bash "$BASE/hospital.sh" ;;
  trauma) bash "$BASE/trauma.sh" ;;
  clean) bash "$BASE/cleaner.sh" ;;
  watchdog) bash "$BASE/watchdog.sh" ;;
  *) echo "Usage: spn [cockpit|hospital|trauma|clean|watchdog]" ;;
esac
EOF
chmod +x "$SPN_BIN/spn"

echo "🌻 Installed! Run: spn cockpit"
#!/bin/bash
# 🌻 SpiderNet Installer (Linux/macOS)
# Usage: curl -fsSL https://github.com/Sattvamusik/spidernet/releases/latest/download/install.sh | bash
set -euo pipefail

USER=$(whoami)
HOME_DIR="/home/$USER"
BASE="$HOME_DIR/.spidernet"
SPN_BIN="$HOME_DIR/.local/bin"
DESKTOP="$HOME_DIR/Desktop"
ASSETS="$BASE/assets"

echo "=== 🌻 Installing SpiderNet for $USER ==="

# 1. Create dirs
mkdir -p "$BASE" "$SPN_BIN" "$ASSETS" "$HOME_DIR/SpiderNet"

# 2. Install deps
sudo apt update -y
sudo apt install -y python3-pyqt5 python3-pil xdg-utils zenity libnotify-bin > /dev/null 2>&1 || true

# 3. Fetch latest release asset (zip)
TMP="/tmp/spidernet.zip"
curl -L -o "$TMP" https://github.com/Sattvamusik/spidernet/releases/latest/download/spidernet_secure.zip
unzip -o "$TMP" -d "$BASE"

# 4. Pre-seed PROJECTS.md / IDEAS.md if missing
[ ! -f "$HOME_DIR/SpiderNet/PROJECTS.md" ] && echo "# Projects" > "$HOME_DIR/SpiderNet/PROJECTS.md"
[ ! -f "$HOME_DIR/SpiderNet/IDEAS.md" ] && echo "# Ideas" > "$HOME_DIR/SpiderNet/IDEAS.md"

# 5. Create spn launcher
cat > "$SPN_BIN/spn" << 'EOF'
#!/bin/bash
BASE="$HOME/.spidernet"
case "$1" in
  cockpit)   nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 & echo "🌻 Cockpit started" ;;
  clean)     "$BASE/cleaner.sh" ;;
  health)    "$BASE/hospital.sh" ;;
  trauma)    "$BASE/trauma.sh" ;;
  sync)      python3 "$BASE/spidersync.py" ;;
  *)         echo "Usage: spn [cockpit|clean|health|trauma|sync]" ;;
esac
EOF
chmod +x "$SPN_BIN/spn"

# 6. Add PATH if missing
grep -q "$SPN_BIN" ~/.bashrc || echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# 7. Desktop shortcut
cat > "$DESKTOP/spidernet.desktop" << EOL
[Desktop Entry]
Name=SpiderNet Cockpit
Comment=Self-Healing Dashboard
Exec=spn cockpit
Icon=$ASSETS/sunflower.png
Terminal=false
Type=Application
Categories=Utility;
EOL
chmod +x "$DESKTOP/spidernet.desktop"

echo "✅ Install complete! Run: spn cockpit"
name: Build & Release SpiderNet

on:
  push:
    tags:
      - "v*.*"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Zip SpiderNet
        run: |
          mkdir -p dist
          zip -r dist/spidernet_secure.zip . -x "*.git*"

      - name: Upload Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/spidernet_secure.zip
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
#!/bin/bash
# 🌻 SpiderNet Installer (Linux/macOS)
set -euo pipefail

USER=$(whoami)
HOME_DIR="$HOME/SpiderNet"
mkdir -p "$HOME_DIR"

echo "=== 🕸️ Installing SpiderNet (Linux/macOS) ==="

# Download latest release ZIP
ZIP_URL=$(curl -s https://api.github.com/repos/Sattvamusik/spidernet/releases/latest \
  | grep "browser_download_url" | grep "spidernet_secure.zip" \
  | cut -d '"' -f 4)

curl -L "$ZIP_URL" -o /tmp/spidernet_secure.zip
unzip -o /tmp/spidernet_secure.zip -d "$HOME_DIR"

# Add to PATH
mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/spn" << 'EOS'
#!/bin/bash
python3 "$HOME/SpiderNet/cockpit.py"
EOS
chmod +x "$HOME/.local/bin/spn"

if ! grep -q ".local/bin" "$HOME/.bashrc"; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
fi

echo "✅ Installed! Run: spn"
#!/bin/bash
echo "🌻 Installing SpiderNet v3.1..."
mkdir -p ~/SpiderNet ~/.spidernet/assets
cp PROJECTS.md ~/SpiderNet/
cp IDEAS.md ~/SpiderNet/
echo "✅ Installed! Run 'python3 ~/.spidernet/cockpit.py'"
