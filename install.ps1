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
