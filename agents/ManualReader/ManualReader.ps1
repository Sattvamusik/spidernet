<#
 🌻 SpiderNet Agent: ManualReader.ps1 (Ordered Reading)
 Purpose: Always read Original v1.0 first, then all Addenda (v2.0, v3.0...).

#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# === Paths ===
$BasePath   = "C:\SpiderNet"
$ManualPath = Join-Path $BasePath "KarmaManual"
$LogDir     = Join-Path $BasePath "Agents\ManualReader\logs"
$LogFile    = Join-Path $LogDir "manualreader.log"

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
}

if (-not (Test-Path $ManualPath)) {
    "[$(Get-Date)] ❌ ERROR: KarmaManual folder not found at $ManualPath" | Out-File -Append $LogFile
    Write-Error "KarmaManual is missing. Agents cannot start."
    exit 1
}

# === Ordered reading ===
$Original = Get-ChildItem -Path $ManualPath -Filter *_v1.0_Original.md -ErrorAction SilentlyContinue
$Others   = Get-ChildItem -Path $ManualPath -Filter *.md -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "*_v1.0_Original.md" } | Sort-Object Name

if (-not $Original -and $Others.Count -eq 0) {
    "[$(Get-Date)] ❌ ERROR: No manual sections found in $ManualPath" | Out-File -Append $LogFile
    Write-Error "No Karma Manual sections present."
    exit 1
}

# Read Original first
foreach ($file in $Original) {
    "[$(Get-Date)] 📖 Reading ORIGINAL manual: $($file.Name)" | Out-File -Append $LogFile
    Get-Content $file.FullName | Out-File -Append $LogFile
    "[$(Get-Date)] ✅ Finished reading $($file.Name)" | Out-File -Append $LogFile
}

# Read all others
foreach ($file in $Others) {
    "[$(Get-Date)] 📖 Reading addendum manual: $($file.Name)" | Out-File -Append $LogFile
    Get-Content $file.FullName | Out-File -Append $LogFile
    "[$(Get-Date)] ✅ Finished reading $($file.Name)" | Out-File -Append $LogFile
}

"[$(Get-Date)] 🌻 ManualReader complete. All agents aligned with Karma Manual." | Out-File -Append $LogFile
Write-Host "🌻 ManualReader finished. Agents are synced with Karma Manual."
exit 0
