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
