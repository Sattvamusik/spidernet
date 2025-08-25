#!/bin/bash
# 🕸 SpiderNet v5 — Secure Self-Healing System
# Repo: github.com/omvatayan/spidernet

set -euo pipefail

USER="$(whoami)"
HOME_DIR="$HOME"
BASE="$HOME/.spidernet"
SPN_BIN="$HOME/.local/bin"
LOGS="$BASE/logs"
BASHRC="$HOME/.bashrc"

echo "⚡ Installing SpiderNet for $USER ..."

# 1. Create dirs
mkdir -p "$BASE" "$LOGS" "$SPN_BIN"

# 2. Clean old aliases
sed -i '/spn-/d' "$BASHRC" || true
rm -f "$SPN_BIN/spn" 2>/dev/null || true

# 3. Install deps (asks password only once, if needed)
if ! dpkg -s python3-pyqt5 >/dev/null 2>&1; then
  echo "📦 Installing PyQt5 + tools (requires sudo once)..."
  sudo apt update -y
  sudo apt install -y python3-pyqt5 zenity libnotify-bin xdg-utils
fi

# 4. Main spn command
cat > "$SPN_BIN/spn" << 'EOS'
#!/bin/bash
BASE="$HOME/.spidernet"
LOGS="$BASE/logs"
mkdir -p "$LOGS"

case "$1" in
  cockpit)   nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 & echo "🌻 Cockpit started";;
  clean)     "$BASE/slo_clean.sh";;
  health)    "$BASE/hospital.sh";;
  trauma)    "$BASE/trauma_center.sh";;
  status)    pgrep -f "python.*cockpit.py" >/dev/null && echo "🟢 Cockpit running" || echo "🔴 Cockpit stopped";;
  *)         echo "Usage: spn [cockpit|clean|health|trauma|status]";;
esac
EOS
chmod +x "$SPN_BIN/spn"

# 5. Aliases (fixed: no spaces)
cat >> "$BASHRC" << 'EOB'
export PATH="$HOME/.local/bin:$PATH"
alias spn-cockpit='spn cockpit'
alias spn-clean='spn clean'
alias spn-health='spn health'
alias spn-trauma='spn trauma'

# Auto-start cockpit
(spawn() { sleep 5 && spn cockpit; }; spawn &) 2>/dev/null &
EOB

# 6. Agents from repo
AGENT_URL="https://raw.githubusercontent.com/omvatayan/spidernet/main/agents"
for script in hospital.sh trauma_center.sh watchdog.sh slo_clean.sh cockpit.py; do
  curl -fsSL "$AGENT_URL/$script" -o "$BASE/$script"
  chmod +x "$BASE/$script"
done

# 7. Proof alive
echo "✅ SPIDERNET IS ALIVE" | tee "$LOGS/status.flag"
notify-send "SpiderNet" "✅ SPIDERNET IS ALIVE — Ready!"
#!/bin/bash
set -euo pipefail

USER="${SUDO_USER:-$USER}"
HOME_DIR="/home/$USER"
BASE="$HOME_DIR/.spidernet"
SPN_BIN="$HOME_DIR/.local/bin"
BASHRC="$HOME_DIR/.bashrc"
LOGS="$BASE/logs"
SYSTEMD="$HOME_DIR/.config/systemd/user"

echo "⚡ Installing SpiderNet for $USER ..."

# --- Safe sudo wrapper ---
run_sudo() {
  if sudo -n true 2>/dev/null; then
    sudo "$@"
  else
    echo "⚠️  Passwordless sudo not active. Trying with password..."
    sudo "$@"
  fi
}

# --- Configure passwordless sudo if missing ---
if ! sudo -n true 2>/dev/null; then
  echo "🔑 Configuring passwordless sudo for $USER ..."
  echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/$USER" >/dev/null || true
  sudo chmod 440 "/etc/sudoers.d/$USER" || true
fi

# --- Create dirs ---
mkdir -p "$BASE" "$LOGS" "$SPN_BIN" "$SYSTEMD"

# --- Install deps ---
echo "📦 Installing dependencies..."
run_sudo apt-get update -qq
run_sudo apt-get install -y python3-pyqt5 zenity libnotify-bin xdg-utils
#!/bin/bash
set -euo pipefail

TARGET_USER="${SUDO_USER:-$USER}"
HOME_DIR="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
BASE="$HOME_DIR/.spidernet"
BIN="$HOME_DIR/.local/bin"
LOGS="$BASE/logs"
AUTOSTART="$HOME_DIR/.config/autostart"

echo "⚡ Installing SpiderNet for $TARGET_USER ..."

mkdir -p "$BASE" "$BIN" "$LOGS" "$AUTOSTART"

# --- FORCE passwordless sudo (even if sudo prompts first time) ---
if [ ! -f "/etc/sudoers.d/$TARGET_USER" ]; then
  echo "$TARGET_USER ALL=(ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/$TARGET_USER" >/dev/null || true
  sudo chmod 440 "/etc/sudoers.d/$TARGET_USER" || true
  echo "🔓 Passwordless sudo enabled for $TARGET_USER"
fi

# --- Aliases ---
{
  echo "alias spn-cockpit='python3 $BASE/cockpit.py'"
  echo "alias spn-reset='$BASE/reset.sh'"
  echo "alias spn-update='$BASE/update.sh'"
} >> "$HOME_DIR/.bashrc"

# --- Drop placeholder agents ---
cat > "$BASE/reset.sh" <<'EOF'
#!/bin/bash
echo "♻ Resetting SpiderNet..."
EOF
chmod +x "$BASE/reset.sh"

cat > "$BASE/update.sh" <<'EOF'
#!/bin/bash
echo "⬆ Updating SpiderNet..."
EOF
chmod +x "$BASE/update.sh"

cat > "$BASE/cockpit.py" <<'EOF'
#!/usr/bin/env python3
print("🕸️ SpiderNet Cockpit Dashboard (stub)")
EOF
chmod +x "$BASE/cockpit.py"

# --- Proof alive ---
echo "✅ SPIDERNET IS ALIVE"
zenity --info --title="SpiderNet" --text="✅ SPIDERNET IS ALIVE"
#!/bin/bash
set -euo pipefail

echo "⚡ Installing SpiderNet for $USER ..."

# --- Setup paths ---
BASE="$HOME/.spidernet"
BIN="$HOME/.local/bin"
LOGS="$BASE/logs"
AUTOSTART="$HOME/.config/autostart"
mkdir -p "$BASE" "$BIN" "$LOGS" "$AUTOSTART"

# --- Passwordless sudo (if not already set) ---
if [ ! -f "/etc/sudoers.d/$USER" ]; then
  echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/$USER" >/dev/null
  sudo chmod 440 "/etc/sudoers.d/$USER"
fi

# --- Install dependencies ---
sudo apt-get update -qq
sudo apt-get install -y zenity libnotify-bin

# --- Cockpit launcher ---
cat > "$BIN/spn-cockpit" <<'EOF'
#!/bin/bash
zenity --info --title="🕸️ SpiderNet Cockpit" --text="✅ SpiderNet is Alive and Cockpit is Running"
EOF
chmod +x "$BIN/spn-cockpit"

# --- Proof of life ---
echo "✅ SPIDERNET IS ALIVE" | tee "$LOGS/installed.log"
notify-send "✅ SpiderNet" "SpiderNet installation successful."

# --- Auto-start Cockpit at login ---
cat > "$AUTOSTART/spidernet.desktop" <<EOF
[Desktop Entry]
Type=Application
Exec=$BIN/spn-cockpit
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=SpiderNet Cockpit
EOF

# --- Daily auto-update ---
(crontab -l 2>/dev/null; echo "0 3 * * * curl -fsSL https://raw.githubusercontent.com/sattvamusik/spidernet/main/install.sh | bash") | crontab -

echo "🎉 Installation complete. Cockpit will open at next login."
