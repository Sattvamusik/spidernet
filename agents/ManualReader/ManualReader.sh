#!/bin/bash
# 🌻 SpiderNet Agent: ManualReader.sh (Ordered Reading)
# Purpose: Always read Original v1.0 first, then all Addenda.

BASE="$HOME/SpiderNet"
MANUAL="$BASE/KarmaManual"
LOGDIR="$BASE/Agents/ManualReader/logs"
LOGFILE="$LOGDIR/manualreader.log"

mkdir -p "$LOGDIR"

if [ ! -d "$MANUAL" ]; then
  echo "[$(date)] ❌ ERROR: KarmaManual folder not found at $MANUAL" | tee -a "$LOGFILE"
  exit 1
fi

ORIGINAL=$(ls "$MANUAL"/*_v1.0_Original.md 2>/dev/null)
OTHERS=$(ls "$MANUAL"/*.md 2>/dev/null | grep -v "_v1.0_Original.md" | sort)

if [ -z "$ORIGINAL" ] && [ -z "$OTHERS" ]; then
  echo "[$(date)] ❌ ERROR: No manual sections found in $MANUAL" | tee -a "$LOGFILE"
  exit 1
fi

# Read Original first
for f in $ORIGINAL; do
  echo "[$(date)] 📖 Reading ORIGINAL manual: $(basename "$f")" | tee -a "$LOGFILE"
  cat "$f" >> "$LOGFILE"
  echo "[$(date)] ✅ Finished reading $(basename "$f")" | tee -a "$LOGFILE"
done

# Read all others
for f in $OTHERS; do
  echo "[$(date)] 📖 Reading addendum manual: $(basename "$f")" | tee -a "$LOGFILE"
  cat "$f" >> "$LOGFILE"
  echo "[$(date)] ✅ Finished reading $(basename "$f")" | tee -a "$LOGFILE"
done

echo "[$(date)] 🌻 ManualReader complete. All agents aligned with Karma Manual." | tee -a "$LOGFILE"
