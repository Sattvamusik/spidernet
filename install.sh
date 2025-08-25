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
