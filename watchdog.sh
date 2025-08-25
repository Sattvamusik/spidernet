#!/bin/bash
# 🌻 SpiderNet Agent — Auto-wired with ManualReader
# Ensure Karma Manual is read before running this agent

AGENT_BASE="$HOME/SpiderNet/agents/ManualReader"

# Prefer Bash reader if available, else PowerShell if on Windows with pwsh
if [ -f "$AGENT_BASE/ManualReader.sh" ]; then
  bash "$AGENT_BASE/ManualReader.sh"
elif command -v pwsh >/dev/null 2>&1 && [ -f "$AGENT_BASE/ManualReader.ps1" ]; then
  pwsh -File "$AGENT_BASE/ManualReader.ps1"
else
  echo "⚠️ ManualReader not found — proceeding anyway (NOT RECOMMENDED)"
fi

echo 'Starting auto-heal monitor...'
