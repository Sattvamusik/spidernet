#!/bin/bash
# Stub Agent with ManualReader hook
BASE="$HOME/.spidernet"
if [ -f "$BASE/ManualReader.sh" ]; then
  bash "$BASE/ManualReader.sh"
fi
echo "Running Trauma agent..."
