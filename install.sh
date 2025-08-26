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
