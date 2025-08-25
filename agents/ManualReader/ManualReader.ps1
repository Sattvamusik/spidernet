<#
 🌻 SpiderNet Agent: ManualReader.ps1
 Purpose: Ensure every agent reads the SpiderNet™ Karma Manual before running.

 - Checks for KarmaManual/ folder
 - Reads all .md files (unaltered)
 - Logs success or failure to manualreader.log
 - Works on PowerShell 5+ and 7+
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# === Paths ===
$BasePath   = "C:\SpiderNet"
$ManualPath = Join-Path $BasePath "KarmaManual"
$LogDir     = Join-Path $BasePath "Agents\ManualReader\logs"
$LogFile    = Join-Path $LogDir "manualreader.log"

# Ensure log dir exists
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
}

# === Verify Karma Manual exists ===
if (-not (Test-Path $ManualPath)) {
    "[$(Get-Date)] ❌ ERROR: KarmaManual folder not found at $ManualPath" | Out-File -Append $LogFile
    Write-Error "KarmaManual is missing. Agents cannot start."
    exit 1
}

# === Read all manual sections ===
$ManualFiles = Get-ChildItem -Path $ManualPath -Filter *.md -ErrorAction Stop

if ($ManualFiles.Count -eq 0) {
    "[$(Get-Date)] ❌ ERROR: No manual sections found in $ManualPath" | Out-File -Append $LogFile
    Write-Error "No Karma Manual sections present."
    exit 1
}

foreach ($file in $ManualFiles) {
    "[$(Get-Date)] 📖 Reading manual: $($file.Name)" | Out-File -Append $LogFile
    Get-Content $file.FullName | Out-File -Append $LogFile
    "[$(Get-Date)] ✅ Finished reading $($file.Name)" | Out-File -Append $LogFile
}

"[$(Get-Date)] 🌻 ManualReader complete. All agents are now aligned with Karma Manual." | Out-File -Append $LogFile
Write-Host "🌻 ManualReader finished. Agents are synced with Karma Manual."
exit 0
