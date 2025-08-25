#!/bin/bash
# 🌻 SpiderNet Installer
set -euo pipefail

BASE="$HOME/.spidernet"
BIN="$HOME/.local/bin"
LOGS="$BASE/logs"

mkdir -p "$BASE" "$BIN" "$LOGS"

# Dependencies
sudo apt-get update -qq
sudo apt-get install -y python3-pyqt5 zenity libnotify-bin xdg-utils

# Install agents from GitHub (update paths once repo is live)
curl -fsSL https://raw.githubusercontent.com/omvatayan/spidernet/main/agents/hospital.sh -o $BASE/hospital.sh
curl -fsSL https://raw.githubusercontent.com/omvatayan/spidernet/main/agents/trauma_center.sh -o $BASE/trauma_center.sh
curl -fsSL https://raw.githubusercontent.com/omvatayan/spidernet/main/agents/watchdog.sh -o $BASE/watchdog.sh
curl -fsSL https://raw.githubusercontent.com/omvatayan/spidernet/main/agents/slo_clean.sh -o $BASE/slo_clean.sh
curl -fsSL https://raw.githubusercontent.com/omvatayan/spidernet/main/agents/cockpit.py -o $BASE/cockpit.py
chmod +x $BASE/*.sh $BASE/cockpit.py

# spn command
cat > $BIN/spn <<'EOS'
#!/bin/bash
BASE="$HOME/.spidernet"
case "$1" in
  cockpit) nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 & ;;
  clean)   "$BASE/slo_clean.sh" ;;
  health|hospital) "$BASE/hospital.sh" ;;
  trauma|repair)   "$BASE/trauma_center.sh" ;;
  watchdog)        "$BASE/watchdog.sh" ;;
  status)          tail -n 10 "$BASE/logs/hospital.log" ;;
  *) echo "Usage: spn {cockpit|clean|health|trauma|watchdog|status}" ;;
esac
EOS
chmod +x $BIN/spn

# Alive check
$BASE/hospital.sh
$BASE/trauma_center.sh
echo "ALIVE $(date)" > "$LOGS/status.flag"

echo -e "\n\033[1;32m==================================================\033[0m"
echo -e "\033[1;32m✅  SPIDERNET IS ALIVE — All agents running fine!\033[0m"
echo -e "\033[1;32m==================================================\033[0m\n"

notify-send "✅ SPIDERNET IS ALIVE" "All agents running fine!" || true

# Auto-open cockpit
nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 &
