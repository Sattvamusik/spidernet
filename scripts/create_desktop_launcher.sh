#!/usr/bin/env bash
# create_desktop_launcher.sh
# Idempotent installer for the DRISHTI Dashboard desktop launcher.
# - Writes ~/Desktop/DRISHTI-Dashboard.desktop (Linux / WSLg)
# - Writes "/mnt/c/Users/sattv/Desktop/DRISHTI Dashboard.cmd" (Windows stub),
#   only if the Windows desktop path is reachable.
# Safe to re-run: overwrites its own targets, never touches unrelated files.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNNER="$REPO_ROOT/scripts/launch-dashboard.sh"

LINUX_DESKTOP="$HOME/Desktop/DRISHTI-Dashboard.desktop"
WIN_DESKTOP="/mnt/c/Users/sattv/Desktop/DRISHTI Dashboard.cmd"

# Optional icon: prefer repo-local favicon if present.
ICON_LINE=""
if [ -f "$REPO_ROOT/public/favicon.ico" ]; then
  ICON_LINE="Icon=$REPO_ROOT/public/favicon.ico"
elif [ -f "$REPO_ROOT/public/favicon.svg" ]; then
  ICON_LINE="Icon=$REPO_ROOT/public/favicon.svg"
fi

mkdir -p "$(dirname "$LINUX_DESKTOP")"

{
  echo "[Desktop Entry]"
  echo "Type=Application"
  echo "Name=DRISHTI Dashboard"
  echo "Comment=Start SETU/DRISHTI deck dashboard and open in browser"
  echo "Exec=/bin/bash -lc \"$RUNNER\""
  echo "Terminal=false"
  echo "StartupNotify=true"
  echo "Categories=Development;"
  if [ -n "$ICON_LINE" ]; then
    echo "$ICON_LINE"
  fi
} > "$LINUX_DESKTOP"

chmod +x "$LINUX_DESKTOP"
echo "Wrote: $LINUX_DESKTOP"

# Windows .cmd stub (guarded).
WIN_DIR="/mnt/c/Users/sattv/Desktop"
if [ -d "$WIN_DIR" ]; then
  # CRLF line endings for Windows correctness.
  printf '@echo off\r\n\r\nwsl.exe -d Ubuntu -- bash -lc "/home/sattv/projects/spidernet-control-deck/scripts/launch-dashboard.sh"\r\n' > "$WIN_DESKTOP"
  echo "Wrote: $WIN_DESKTOP"
else
  echo "Note: $WIN_DIR not reachable — skipped Windows .cmd stub."
fi

echo "Done."
