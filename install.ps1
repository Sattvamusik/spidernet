#!/bin/bash
# 🌻 SpiderNet installer (fetches latest release ZIP)
set -euo pipefail

REPO="omvatayan/spidernet"
LATEST_URL=$(curl -s https://api.github.com/repos/$REPO/releases/latest \
  | grep "browser_download_url" \
  | grep "spidernet_secure.zip" \
  | cut -d '"' -f 4)

echo "📦 Downloading SpiderNet from: $LATEST_URL"
mkdir -p ~/SpiderNet && cd ~/SpiderNet
curl -L "$LATEST_URL" -o spidernet_secure.zip
unzip -o spidernet_secure.zip
chmod +x install.sh || true
./install.sh  # this re-runs the inner installer from ZIP
Write-Output "🌻 Installing SpiderNet v3.1..."
New-Item -ItemType Directory -Force -Path $HOME\SpiderNet | Out-Null
Copy-Item PROJECTS.md -Destination $HOME\SpiderNet\PROJECTS.md -Force
Copy-Item IDEAS.md -Destination $HOME\SpiderNet\IDEAS.md -Force
Write-Output "✅ Installed! Run 'python %USERPROFILE%\.spidernet\cockpit.py'"
