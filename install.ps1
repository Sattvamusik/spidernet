Write-Output "🌻 Installing SpiderNet v3.1..."
New-Item -ItemType Directory -Force -Path $HOME\SpiderNet | Out-Null
Copy-Item PROJECTS.md -Destination $HOME\SpiderNet\PROJECTS.md -Force
Copy-Item IDEAS.md -Destination $HOME\SpiderNet\IDEAS.md -Force
Write-Output "✅ Installed! Run 'python %USERPROFILE%\.spidernet\cockpit.py'"
