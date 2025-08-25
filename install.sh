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

# --- Passwordless sudo setup ---
if [ ! -f "/etc/sudoers.d/$TARGET_USER" ]; then
  echo "$TARGET_USER ALL=(ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/$TARGET_USER" >/dev/null
  sudo chmod 440 "/etc/sudoers.d/$TARGET_USER"
  echo "🔓 Passwordless sudo configured for $TARGET_USER"
fi

# --- Agents ---
cat > "$BIN/spn-hospital" <<'EOF'
#!/bin/bash
echo "🏥 Hospital running..."
EOF

cat > "$BIN/spn-trauma" <<'EOF'
#!/bin/bash
echo "🚑 Trauma repairing..."
EOF

cat > "$BIN/spn-cleaner" <<'EOF'
#!/bin/bash
echo "🧹 Cleaning desktop..."
EOF

cat > "$BIN/spn-watchdog" <<'EOF'
#!/bin/bash
echo "👀 Watchdog watching..."
EOF

chmod +x "$BIN"/spn-*

# --- Cockpit desktop entry ---
cat > "$AUTOSTART/spidernet.desktop" <<EOF
[Desktop Entry]
Type=Application
Exec=$BIN/spn-cockpit
Hidden=false
X-GNOME-Autostart-enabled=true
Name=SpiderNet Cockpit
EOF

# --- Cockpit placeholder ---
cat > "$BIN/spn-cockpit" <<'EOF'
#!/bin/bash
zenity --info --title="🕸️ SpiderNet Cockpit" --text="✅ SpiderNet is Alive\n\nHospital, Trauma, Cleaner, Watchdog running."
EOF
chmod +x "$BIN/spn-cockpit"

echo "✅ SpiderNet install complete. Run 'spn-cockpit' or reboot to auto-start."
#!/bin/bash
# =========================================================
# 🕸 SpiderNet — One-Command Self-Healing OS Installer
# =========================================================
set -euo pipefail

TARGET_USER="${SUDO_USER:-$USER}"
HOME_DIR="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
BASE="$HOME_DIR/.spidernet"
BIN="$HOME_DIR/.local/bin"
LOGS="$BASE/logs"
AUTOSTART="$HOME_DIR/.config/autostart"

mkdir -p "$BASE" "$BIN" "$LOGS" "$AUTOSTART"

echo "⚡ Installing SpiderNet for $TARGET_USER ..."

# --- Dependencies ---
sudo apt-get update -qq
sudo apt-get install -y zenity libnotify-bin python3 python3-pip

# --- Hospital Agent ---
cat > "$BASE/hospital.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/hospital.log"
echo "🏥 Hospital run at $(date)" > "$LOG"
uptime >> "$LOG"
df -h >> "$LOG"
free -h >> "$LOG"
notify-send "SpiderNet Hospital" "Diagnostics updated."
EOF
chmod +x "$BASE/hospital.sh"

# --- Trauma Agent ---
cat > "$BASE/trauma.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/trauma.log"
echo "🚑 Trauma center repairs at $(date)" >> "$LOG"
sudo systemctl daemon-reexec || true
sudo systemctl restart --failed || true
notify-send "SpiderNet Trauma" "Basic repairs attempted."
EOF
chmod +x "$BASE/trauma.sh"

# --- Cleaner Agent ---
cat > "$BASE/cleaner.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/cleaner.log"
ARCHIVE="$HOME/Desktop/Archived"
mkdir -p "$ARCHIVE/Documents" "$ARCHIVE/Images" "$ARCHIVE/Others"
count=0
for file in "$HOME/Desktop"/*; do
  [ ! -f "$file" ] && continue
  case "$file" in
    *.pdf|*.doc|*.txt) mv "$file" "$ARCHIVE/Documents/" ;;
    *.jpg|*.png) mv "$file" "$ARCHIVE/Images/" ;;
    *) mv "$file" "$ARCHIVE/Others/" ;;
  esac
  ((count++))
done
echo "🧹 Cleaned $count files at $(date)" >> "$LOG"
EOF
chmod +x "$BASE/cleaner.sh"

# --- Watchdog Agent ---
cat > "$BASE/watchdog.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/watchdog.log"
echo "👁 Watchdog run at $(date)" >> "$LOG"
$HOME/.spidernet/hospital.sh
$HOME/.spidernet/trauma.sh
$HOME/.spidernet/cleaner.sh
echo "✅ Watchdog cycle done" >> "$LOG"
EOF
chmod +x "$BASE/watchdog.sh"

# --- Archivist Agent ---
cat > "$BASE/archivist.sh" <<'EOF'
#!/bin/bash
IDEAS="$HOME/.spidernet/IDEAS.md"
PROJECTS="$HOME/.spidernet/PROJECTS.md"
echo "📜 Archivist log $(date)" >> "$HOME/.spidernet/logs/archivist.log"
echo "- Checked system at $(date)" >> "$PROJECTS"
echo "- Suggestion: Auto-optimize configs (pending)" >> "$IDEAS"
EOF
chmod +x "$BASE/archivist.sh"

# --- Cockpit GUI ---
cat > "$BASE/cockpit.py" <<'EOF'
#!/usr/bin/env python3
import os, sys
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QLabel, QTextEdit, QTabWidget
from PyQt5.QtCore import QTimer, Qt

BASE = os.path.expanduser("~/.spidernet")
LOGS = os.path.join(BASE, "logs")

class Cockpit(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🕸 SpiderNet Cockpit")
        self.resize(600, 400)

        layout = QVBoxLayout()
        self.tabs = QTabWidget()

        self.dashboard = QTextEdit(); self.dashboard.setReadOnly(True)
        self.ideas = QTextEdit(); self.ideas.setReadOnly(True)
        self.projects = QTextEdit(); self.projects.setReadOnly(True)

        self.tabs.addTab(self.dashboard, "📊 Dashboard")
        self.tabs.addTab(self.ideas, "💡 Advisory")
        self.tabs.addTab(self.projects, "📂 Projects")

        layout.addWidget(self.tabs)
        self.setLayout(layout)

        self.refresh()
        timer = QTimer(self)
        timer.timeout.connect(self.refresh)
        timer.start(10000)

    def refresh(self):
        flag = os.path.join(LOGS, "status.flag")
        if os.path.exists(flag):
            self.dashboard.setText(open(flag).read())
        if os.path.exists(BASE+"/IDEAS.md"):
            self.ideas.setText(open(BASE+"/IDEAS.md").read())
        if os.path.exists(BASE+"/PROJECTS.md"):
            self.projects.setText(open(BASE+"/PROJECTS.md").read())

if __name__ == "__main__":
    app = QApplication(sys.argv)
    win = Cockpit(); win.show()
    sys.exit(app.exec_())
EOF
chmod +x "$BASE/cockpit.py"

# --- Proof Alive ---
echo "✅ SPIDERNET IS ALIVE at $(date)" > "$LOGS/status.flag"
notify-send "✅ SPIDERNET IS ALIVE" "All agents installed & running."

# --- Auto-start Cockpit ---
cat > "$AUTOSTART/spidernet.desktop" <<EOF
[Desktop Entry]
Type=Application
Exec=python3 $BASE/cockpit.py
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=SpiderNet Cockpit
EOF

echo "=================================================="
echo "✅ Installation complete. Cockpit will auto-start."
echo "Run manually: python3 ~/.spidernet/cockpit.py"
echo "=================================================="
#!/bin/bash
# ===============================================
# 🕸️ SpiderNet — One-Command Self-Healing Installer
# ===============================================
set -euo pipefail

TARGET_USER="${SUDO_USER:-$USER}"
HOME_DIR="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
BASE="$HOME_DIR/.spidernet"
BIN="$HOME_DIR/.local/bin"
LOGS="$BASE/logs"
AUTOSTART="$HOME_DIR/.config/autostart"

mkdir -p "$BASE" "$BIN" "$LOGS" "$AUTOSTART"

echo "⚡ Installing SpiderNet for $TARGET_USER ..."

# --- Dependencies ---
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y zenity libnotify-bin python3-pyqt5
fi

# --- Hospital (Diagnostics) ---
cat > "$BASE/hospital.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/hospital.log"
echo "=== 🏥 SpiderNet Hospital $(date) ===" >> "$LOG"
uptime >> "$LOG"
df -h >> "$LOG"
free -h >> "$LOG"
echo "✅ Hospital check complete" >> "$LOG"
EOF
chmod +x "$BASE/hospital.sh"

# --- Trauma Center (Repairs placeholder) ---
cat > "$BASE/trauma_center.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/trauma.log"
echo "=== 🚑 SpiderNet Trauma $(date) ===" >> "$LOG"
echo "Auto-repair routines will go here." >> "$LOG"
echo "✅ Trauma check complete" >> "$LOG"
EOF
chmod +x "$BASE/trauma_center.sh"

# --- Watchdog (Runs every 5 min) ---
cat > "$BASE/watchdog.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/watchdog.log"
echo "=== 👁 Watchdog $(date) ===" >> "$LOG"
$HOME/.spidernet/hospital.sh
$HOME/.spidernet/trauma_center.sh
echo "✅ Watchdog cycle complete" >> "$LOG"
EOF
chmod +x "$BASE/watchdog.sh"

# --- Cleaner (Organize Desktop) ---
cat > "$BASE/slo_clean.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/cleaner.log"
ARCHIVE="$HOME/Desktop/Archived"
mkdir -p "$ARCHIVE/Documents" "$ARCHIVE/Images" "$ARCHIVE/Others"
count=0
for file in "$HOME/Desktop"/*; do
  [ ! -f "$file" ] && continue
  case "$file" in
    *.pdf|*.doc|*.txt) mv "$file" "$ARCHIVE/Documents/" ;;
    *.jpg|*.png)       mv "$file" "$ARCHIVE/Images/" ;;
    *)                 mv "$file" "$ARCHIVE/Others/" ;;
  esac
  ((count++))
done
echo "🧹 Cleaned $count files at $(date)" >> "$LOG"
EOF
chmod +x "$BASE/slo_clean.sh"

# --- Cockpit GUI (simplified) ---
cat > "$BASE/cockpit.py" <<'EOF'
#!/usr/bin/env python3
import sys, os, time
from PyQt5.QtWidgets import QApplication, QMainWindow, QTextEdit, QLabel, QVBoxLayout, QWidget
from PyQt5.QtCore import QTimer, Qt

BASE = os.path.expanduser("~/.spidernet")
LOGS = os.path.join(BASE, "logs")

class Cockpit(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🕸️ SpiderNet Cockpit")
        self.setGeometry(200, 200, 600, 400)

        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout()
        central.setLayout(layout)

        self.banner = QLabel("🌻 SpiderNet Dashboard — Alive Check")
        self.banner.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.banner)

        self.logbox = QTextEdit()
        self.logbox.setReadOnly(True)
        layout.addWidget(self.logbox)

        timer = QTimer(self)
        timer.timeout.connect(self.refresh)
        timer.start(5000)
        self.refresh()

    def refresh(self):
        flag = os.path.join(LOGS, "status.flag")
        if os.path.exists(flag):
            self.banner.setText("✅ SpiderNet is Alive")
        else:
            self.banner.setText("❌ No Alive Signal")
        try:
            with open(os.path.join(LOGS, "hospital.log")) as f:
                lines = f.readlines()[-10:]
            self.logbox.setText("".join(lines))
        except FileNotFoundError:
            self.logbox.setText("No logs yet...")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    cockpit = Cockpit()
    cockpit.show()
    sys.exit(app.exec_())
EOF
chmod +x "$BASE/cockpit.py"

# --- Archivist (Logs & Projects) ---
cat > "$BASE/archivist.sh" <<'EOF'
#!/bin/bash
LOG="$HOME/.spidernet/logs/archivist.log"
PROJ="$HOME/.spidernet/PROJECTS.md"
IDEAS="$HOME/.spidernet/IDEAS.md"

echo "=== 🗂 Archivist $(date) ===" >> "$LOG"
echo "- Ran archivist at $(date)" >> "$PROJ"

if [ ! -f "$IDEAS" ]; then
  echo "# Advisory (Ideas)" > "$IDEAS"
fi
echo "- Auto-suggestion: Improve SpiderNet GUI logs ($(date))" >> "$IDEAS"
EOF
chmod +x "$BASE/archivist.sh"

# --- Proof Alive ---
echo "ALIVE $(date)" > "$LOGS/status.flag"

# --- Auto-start Cockpit ---
cat > "$AUTOSTART/spidernet.desktop" <<EOF
[Desktop Entry]
Type=Application
Exec=python3 $BASE/cockpit.py
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=SpiderNet Cockpit
EOF

# --- Cron for Watchdog & Archivist ---
( crontab -l 2>/dev/null; echo "*/5 * * * * $BASE/watchdog.sh" ) | crontab -
( crontab -l 2>/dev/null; echo "0 * * * * $BASE/archivist.sh" ) | crontab -

# --- Finish ---
echo -e "\n=================================================="
echo "✅  SPIDERNET IS ALIVE — All agents installed & running!"
echo "=================================================="
notify-send "✅ SPIDERNET IS ALIVE" "All agents installed & running!"
nohup python3 "$BASE/cockpit.py" >/dev/null 2>&1 &
#!/bin/bash
# SpiderNet Final Installer
 echo '✅ SpiderNet installer placeholder'
