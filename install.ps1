# 🌻 SpiderNet v4.0 Installer (Windows PowerShell)

$ErrorActionPreference = "Stop"
$Base = "$env:USERPROFILE\.spidernet"
$InstallDir = "$env:USERPROFILE\SpiderNet"
$Bin = "$env:USERPROFILE\.spidernet\bin"
$ZipUrl = "https://github.com/Sattvamusik/spidernet/releases/latest/download/spidernet_secure.zip"

Write-Host "🌻 Installing SpiderNet v4.0 Sunflower Cockpit..."

# Ensure dirs
New-Item -ItemType Directory -Force -Path $Base, $InstallDir, $Bin | Out-Null

# Download ZIP
$ZipPath = "$env:TEMP\spidernet_secure.zip"
Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath

# Extract
Expand-Archive -Force -Path $ZipPath -DestinationPath $InstallDir

# Ensure cockpit seeds
$Projects = Join-Path $InstallDir "PROJECTS.md"
$Ideas = Join-Path $InstallDir "IDEAS.md"
if (-not (Test-Path $Projects)) { "# Projects" | Out-File -Encoding utf8 $Projects }
if (-not (Test-Path $Ideas)) { "# Ideas" | Out-File -Encoding utf8 $Ideas }

# Create spn.cmd shim
$Shim = Join-Path $Bin "spn.cmd"
"@echo off
python %USERPROFILE%\SpiderNet\cockpit.py %*" | Out-File -Encoding ascii $Shim
Set-ItemProperty $Shim -Name IsReadOnly -Value $false
icacls $Shim /grant Everyone:F /T /C | Out-Null

# Add to PATH
$envPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($envPath -notlike "*$Bin*") {
    [Environment]::SetEnvironmentVariable("Path", "$envPath;$Bin", "User")
    Write-Host "✅ Added $Bin to PATH. Restart PowerShell."
}

Write-Host "✅ Install complete. Run with: spn cockpit"
Write-Host "🌻 Installing SpiderNet (Windows)" -ForegroundColor Cyan

$InstallDir = "$env:USERPROFILE\SpiderNet"
$ZipPath = "$env:TEMP\spidernet_secure.zip"

New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
Invoke-WebRequest -Uri "https://github.com/Sattvamusik/spidernet/releases/latest/download/spidernet_secure.zip" -OutFile $ZipPath
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force

Write-Host "✅ Installed to $InstallDir" -ForegroundColor Green
Write-Host "Run Cockpit with: python $InstallDir\cockpit.py"
Write-Host "=== 🌻 Installing SpiderNet (Windows) ===" -ForegroundColor Cyan

$InstallDir = "$env:USERPROFILE\SpiderNet"
$ZipPath = "$env:TEMP\spidernet_secure.zip"

# Fetch latest release ZIP
$ReleaseInfo = Invoke-RestMethod https://api.github.com/repos/Sattvamusik/spidernet/releases/latest
$ZipUrl = $ReleaseInfo.assets | Where-Object { $_.name -like "spidernet_secure.zip" } | Select-Object -ExpandProperty browser_download_url

if (-not $ZipUrl) {
    Write-Error "❌ Could not find spidernet_secure.zip in latest release"
    exit 1
}

Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath
Expand-Archive -Force $ZipPath -DestinationPath $InstallDir

# Create Desktop shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\SpiderNet Cockpit.lnk")
$Shortcut.TargetPath = "python"
$Shortcut.Arguments = "`"$InstallDir\cockpit.py`""
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.IconLocation = "$InstallDir\assets\sunflower.png"
$Shortcut.Save()

Write-Host "✅ Installed! Shortcut created on Desktop." -ForegroundColor Green
Write-Host "=== 🌻 Installing SpiderNet (Windows) ===" -ForegroundColor Cyan

$InstallDir = "$env:USERPROFILE\SpiderNet"
$ZipPath    = "$env:TEMP\spidernet_secure.zip"

# Get latest release ZIP
$ReleaseInfo = Invoke-RestMethod https://api.github.com/repos/Sattvamusik/spidernet/releases/latest
$ZipUrl = $ReleaseInfo.assets | Where-Object { $_.name -eq "spidernet_secure.zip" } | Select-Object -ExpandProperty browser_download_url

if (-not $ZipUrl) {
  Write-Error "❌ Could not find spidernet_secure.zip in latest release"
  exit 1
}

Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath
Expand-Archive -Force $ZipPath -DestinationPath $InstallDir

# Create shortcut on Desktop
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\SpiderNet Cockpit.lnk")
$Shortcut.TargetPath = "python"
$Shortcut.Arguments = "`"$InstallDir\cockpit.py`""
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.IconLocation = "$InstallDir\assets\sunflower.png"
$Shortcut.Save()

Write-Host "✅ Installed! Run from Desktop shortcut or 'spn cockpit'." -ForegroundColor Green
Write-Host "=== 🌻 Installing SpiderNet (Windows) ===" -ForegroundColor Cyan

$InstallDir = "$env:USERPROFILE\SpiderNet"
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

# Get latest release ZIP
$ReleaseInfo = Invoke-RestMethod https://api.github.com/repos/Sattvamusik/spidernet/releases/latest
$ZipUrl = $ReleaseInfo.assets | Where-Object { $_.name -like "spidernet_secure.zip" } | Select-Object -ExpandProperty browser_download_url

if (-not $ZipUrl) {
  Write-Host "❌ Could not find spidernet_secure.zip in the latest release!" -ForegroundColor Red
  exit 1
}

$ZipPath = "$env:TEMP\spidernet_secure.zip"
Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath
Expand-Archive -Force $ZipPath -DestinationPath $InstallDir

# Create shortcut on Desktop
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\SpiderNet Cockpit.lnk")
$Shortcut.TargetPath = "python"
$Shortcut.Arguments = "`"$InstallDir\cockpit.py`""
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.IconLocation = "$InstallDir\assets\sunflower.png"
$Shortcut.Save()

Write-Host "✅ Installed! Shortcut created on Desktop." -ForegroundColor Green
$ReleaseInfo = Invoke-RestMethod https://api.github.com/repos/Sattvamusik/spidernet/releases/latest
$ZipUrl = $ReleaseInfo.assets | Where-Object { $_.name -like "spidernet_secure.zip" } | Select-Object -ExpandProperty browser_download_url
Invoke-WebRequest -Uri $ZipUrl -OutFile "$env:TEMP\spidernet_secure.zip"
Expand-Archive -Force "$env:TEMP\spidernet_secure.zip" -DestinationPath $InstallDir
# 🌻 SpiderNet Installer (Windows)
Write-Host "=== 🕸️ Installing SpiderNet (Windows) ===" -ForegroundColor Cyan

$InstallDir = "$env:USERPROFILE\SpiderNet"
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

# --- 1. Download latest release asset ---
$ReleaseInfo = Invoke-RestMethod https://api.github.com/repos/Sattvamusik/spidernet/releases/latest
$ZipUrl = $ReleaseInfo.assets | Where-Object { $_.name -like "spidernet_secure.zip" } | Select-Object -ExpandProperty browser_download_url

if (-not $ZipUrl) {
    Write-Error "❌ Could not find spidernet_secure.zip in latest release!"
    exit 1
}

$ZipPath = "$env:TEMP\spidernet_secure.zip"
Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath
Expand-Archive -Force $ZipPath -DestinationPath $InstallDir

# --- 2. Create desktop shortcut ---
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\SpiderNet Cockpit.lnk")
$Shortcut.TargetPath = "python"
$Shortcut.Arguments = "`"$InstallDir\cockpit.py`""
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.IconLocation = "$InstallDir\assets\sunflower.png"
$Shortcut.Save()

Write-Host "🌻 Installed! Shortcut created on Desktop." -ForegroundColor Green
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
# 🌻 SpiderNet Installer (Windows)
Write-Host "=== 🕸️ Installing SpiderNet (Windows) ===" -ForegroundColor Cyan

$InstallDir = "$env:USERPROFILE\SpiderNet"
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

# Get latest release ZIP
$ReleaseInfo = Invoke-RestMethod https://api.github.com/repos/Sattvamusik/spidernet/releases/latest
$ZipUrl = $ReleaseInfo.assets | Where-Object { $_.name -like "spidernet_secure.zip" } | Select-Object -ExpandProperty browser_download_url

$ZipPath = "$env:TEMP\spidernet_secure.zip"
Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath
Expand-Archive -Force $ZipPath -DestinationPath $InstallDir

# Create shortcut on Desktop
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\SpiderNet Cockpit.lnk")
$Shortcut.TargetPath = "python"
$Shortcut.Arguments = "`"$InstallDir\cockpit.py`""
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.IconLocation = "$InstallDir\assets\sunflower.png"
$Shortcut.Save()

Write-Host "✅ Installed! Shortcut created on Desktop." -ForegroundColor Green
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
