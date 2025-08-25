#!/bin/bash
# 🌻 SpiderNet Agent: ManualReader.sh
# Reads Karma Manual sections from ~/SpiderNet/KarmaManual/

BASE="$HOME/SpiderNet"
MANUAL="$BASE/KarmaManual"
LOGDIR="$BASE/Agents/ManualReader/logs"
LOGFILE="$LOGDIR/manualreader.log"

mkdir -p "$LOGDIR"

if [ ! -d "$MANUAL" ]; then
  echo "[$(date)] ❌ ERROR: KarmaManual folder not found at $MANUAL" | tee -a "$LOGFILE"
  exit 1
fi

FILES=$(ls "$MANUAL"/*.md 2>/dev/null)
if [ -z "$FILES" ]; then
  echo "[$(date)] ❌ ERROR: No manual sections found in $MANUAL" | tee -a "$LOGFILE"
  exit 1
fi

for f in $FILES; do
  echo "[$(date)] 📖 Reading manual: $(basename "$f")" | tee -a "$LOGFILE"
  cat "$f" >> "$LOGFILE"
  echo "[$(date)] ✅ Finished reading $(basename "$f")" | tee -a "$LOGFILE"
done

echo "[$(date)] 🌻 ManualReader complete. All agents aligned with Karma Manual." | tee -a "$LOGFILE"
