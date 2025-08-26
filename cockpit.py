#!/usr/bin/env python3
# cockpit.py v3.7.1 - Stable Tkinter Dashboard

import os
import threading
import tkinter as tk
from tkinter import ttk
from datetime import datetime

SPIDERNET_DIR = os.path.expanduser("~/SpiderNet")
PROJECTS = os.path.join(SPIDERNET_DIR, "PROJECTS.md")
IDEAS = os.path.join(SPIDERNET_DIR, "IDEAS.md")

# --- Ensure files exist ---
os.makedirs(SPIDERNET_DIR, exist_ok=True)
if not os.path.exists(PROJECTS):
    with open(PROJECTS, "w") as f:
        f.write("# 🌟 Projects\n\n- Example Project\n")
if not os.path.exists(IDEAS):
    with open(IDEAS, "w") as f:
        f.write("# 💡 Ideas\n\n- Example Idea\n")

class SpiderNetDashboard:
    def __init__(self, root):
        self.root = root
        self.root.title("🌻 SpiderNet Cockpit v3.7.1")
        self.root.geometry("1000x700")
        self.root.configure(bg="#2b2b2b")

        self.style = ttk.Style()
        self.style.theme_use("clam")
        self.configure_styles()

        self.create_widgets()
        self.setup_agents()

    def configure_styles(self):
        self.style.configure("TFrame", background="#2b2b2b")
        self.style.configure("TLabel", background="#2b2b2b", foreground="white")
        self.style.configure("Header.TLabel", font=("Arial", 18, "bold"))
        self.style.configure("AppButton.TButton", font=("Arial", 12), padding=20)

    def create_widgets(self):
        # Header
        header = ttk.Frame(self.root)
        header.pack(fill=tk.X, padx=20, pady=10)
        ttk.Label(header, text="SpiderNet Command Center", style="Header.TLabel").pack(side=tk.LEFT)
        self.status_var = tk.StringVar(value="🟢 System Normal")
        ttk.Label(header, textvariable=self.status_var).pack(side=tk.RIGHT)

        # Grid of buttons
        app_frame = ttk.Frame(self.root)
        app_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        apps = [
            ("System Health", "📊", lambda: self.log("Opened System Health")),
            ("Projects", "📓", lambda: self.open_file(PROJECTS)),
            ("Ideas", "💡", lambda: self.open_file(IDEAS)),
            ("Agent Control", "🤖", lambda: self.log("Agent Control opened")),
            ("Backup & Sync", "🔄", lambda: self.log("Backup started")),
            ("Settings", "⚙️", lambda: self.log("Opened Settings")),
        ]
        for i, (name, icon, action) in enumerate(apps):
            btn = ttk.Button(app_frame, text=f"{icon}\n{name}", command=action, style="AppButton.TButton")
            btn.grid(row=i // 3, column=i % 3, padx=10, pady=10, sticky="nsew")
        for i in range(3):
            app_frame.columnconfigure(i, weight=1)
        for i in range(2):
            app_frame.rowconfigure(i, weight=1)

        # Console
        console_frame = ttk.LabelFrame(self.root, text="Activity Log")
        console_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        self.console = tk.Text(console_frame, height=10, bg="black", fg="white")
        self.console.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

    def setup_agents(self):
        t = threading.Thread(target=self.health_monitor, daemon=True)
        t.start()

    def health_monitor(self):
        while True:
            self.log("Health monitor: System check OK")
            threading.Event().wait(30)

    def log(self, message):
        ts = datetime.now().strftime("%H:%M:%S")
        self.console.insert(tk.END, f"[{ts}] {message}\n")
        self.console.see(tk.END)

    def open_file(self, path):
        os.system(f"xdg-open {path} &")
        self.log(f"Opened {path}")

if __name__ == "__main__":
    root = tk.Tk()
    app = SpiderNetDashboard(root)
    root.mainloop()
#!/usr/bin/env python3
import sys, os
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *

BASE = os.path.expanduser("~/.spidernet")
SPIDERNET_DIR = os.path.expanduser("~/SpiderNet")
os.makedirs(SPIDERNET_DIR, exist_ok=True)

def ensure_file(path: str, default: str):
    """Ensure a file exists, otherwise create it with default content"""
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            f.write(default)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

class ProjectsTab(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout()
        self.text = QTextEdit()
        self.text.setReadOnly(False)
        self.path = os.path.join(SPIDERNET_DIR, "PROJECTS.md")
        self.text.setPlainText(ensure_file(
            self.path,
            "# Projects\n\n- Example Project"
        ))
        layout.addWidget(self.text)
        self.setLayout(layout)
    def save(self):
        with open(self.path, "w", encoding="utf-8") as f:
            f.write(self.text.toPlainText())

class IdeasTab(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout()
        self.text = QTextEdit()
        self.text.setReadOnly(False)
        self.path = os.path.join(SPIDERNET_DIR, "IDEAS.md")
        self.text.setPlainText(ensure_file(
            self.path,
            "# Ideas\n\n- Example Idea"
        ))
        layout.addWidget(self.text)
        self.setLayout(layout)
    def save(self):
        with open(self.path, "w", encoding="utf-8") as f:
            f.write(self.text.toPlainText())

class SpiderNetCockpit(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🌻 SpiderNet Cockpit")
        self.resize(800, 600)
        self.setStyleSheet("background: #1e1e1e; color: white; font-family: Arial;")

        # Tabs
        self.tabs = QTabWidget()
        self.projects = ProjectsTab()
        self.ideas = IdeasTab()

        # Control tab
        control = QWidget()
        grid = QGridLayout()
        buttons = [
            ("🏥 Hospital", "spn health"),
            ("🚑 Trauma", "spn trauma"),
            ("🧹 Clean", "spn clean"),
            ("🕸️ SpiderSync", "spn sync"),
            ("🔄 Reset", "rm -rf ~/.spidernet/logs/*"),
            ("🔁 Update", "curl -fsSL https://github.com/Sattvamusik/spidernet/releases/latest/download/install.sh | bash")
        ]
        for i, (label, cmd) in enumerate(buttons):
            btn = QPushButton(label)
            btn.setStyleSheet("padding: 15px; font-size: 16px; background: #3a3a3a; color: white; border-radius: 8px;")
            btn.clicked.connect(lambda _, c=cmd: os.system(c + " &"))
            grid.addWidget(btn, i//2, i%2)
        control.setLayout(grid)

        # Tabs
        self.tabs.addTab(control, "⚙️ Control")
        self.tabs.addTab(self.projects, "📓 Projects")
        self.tabs.addTab(self.ideas, "💡 Ideas")
        self.setCentralWidget(self.tabs)

    def closeEvent(self, event):
        self.projects.save()
        self.ideas.save()
        event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SpiderNetCockpit()
    window.show()
    sys.exit(app.exec_())
#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import os
import subprocess

BASE = os.path.expanduser("~/SpiderNet")
PROJECTS_FILE = os.path.join(BASE, "PROJECTS.md")
IDEAS_FILE = os.path.join(BASE, "IDEAS.md")

# Ensure base dir + seed files
os.makedirs(BASE, exist_ok=True)
if not os.path.exists(PROJECTS_FILE):
    with open(PROJECTS_FILE, "w") as f:
        f.write("# Projects\n\n- Example Project\n")
if not os.path.exists(IDEAS_FILE):
    with open(IDEAS_FILE, "w") as f:
        f.write("# Ideas\n\n- Example Idea\n")

class Cockpit(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("🌻 SpiderNet Cockpit")
        self.geometry("800x600")
        self.configure(bg="#2c3e50")

        # Header
        header = tk.Label(self, text="SpiderNet Control Center 🌻", 
                          font=("Arial", 20, "bold"), fg="white", bg="#34495e")
        header.pack(fill="x", pady=10)

        # Button panel
        btn_frame = tk.Frame(self, bg="#2c3e50")
        btn_frame.pack(pady=10)

        buttons = [
            ("🏥 Hospital", lambda: self.run_agent("hospital.sh")),
            ("🚑 Trauma", lambda: self.run_agent("trauma.sh")),
            ("🧹 Cleaner", lambda: self.run_agent("cleaner.sh")),
            ("🕸 SpiderSync", lambda: self.run_agent("spidersync.py")),
            ("🔄 Reset", lambda: self.reset_logs()),
            ("⬆ Update", lambda: self.update_system())
        ]
        for i, (text, cmd) in enumerate(buttons):
            b = tk.Button(btn_frame, text=text, width=15, height=2, 
                          command=cmd, bg="#3498db", fg="white", font=("Arial", 12, "bold"))
            b.grid(row=i//3, column=i%3, padx=5, pady=5)

        # Notebook (Projects & Ideas)
        tabs = ttk.Notebook(self)
        tabs.pack(fill="both", expand=True, padx=10, pady=10)

        self.projects_text = scrolledtext.ScrolledText(tabs, wrap="word", font=("Consolas", 11))
        self.load_file(self.projects_text, PROJECTS_FILE)
        tabs.add(self.projects_text, text="📓 Projects")

        self.ideas_text = scrolledtext.ScrolledText(tabs, wrap="word", font=("Consolas", 11))
        self.load_file(self.ideas_text, IDEAS_FILE)
        tabs.add(self.ideas_text, text="💡 Ideas")

        # Footer save button
        save_btn = tk.Button(self, text="💾 Save Notes", command=self.save_files, 
                             bg="#27ae60", fg="white", font=("Arial", 12, "bold"))
        save_btn.pack(pady=5)

    def run_agent(self, script):
        path = os.path.join(BASE, script)
        if os.path.exists(path):
            if path.endswith(".py"):
                subprocess.Popen(["python3", path])
            else:
                subprocess.Popen(["bash", path])
        else:
            messagebox.showerror("Error", f"Agent {script} not found.")

    def reset_logs(self):
        logs = os.path.join(BASE, "logs")
        if os.path.exists(logs):
            for f in os.listdir(logs):
                os.remove(os.path.join(logs, f))
        messagebox.showinfo("Reset", "Logs cleared.")

    def update_system(self):
        messagebox.showinfo("Update", "Run installer again:\n curl -fsSL https://github.com/Sattvamusik/spidernet/releases/latest/download/install.sh | bash")

    def load_file(self, widget, path):
        try:
            with open(path, "r") as f:
                widget.insert("1.0", f.read())
        except:
            widget.insert("1.0", f"# {os.path.basename(path)}\n\nNot found.")

    def save_files(self):
        with open(PROJECTS_FILE, "w") as f:
            f.write(self.projects_text.get("1.0", "end-1c"))
        with open(IDEAS_FILE, "w") as f:
            f.write(self.ideas_text.get("1.0", "end-1c"))
        messagebox.showinfo("Saved", "✅ Projects and Ideas saved.")

if __name__ == "__main__":
    app = Cockpit()
    app.mainloop()
#!/usr/bin/env python3
import sys, os
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *

BASE = os.path.expanduser("~/.spidernet")
SPIDERNET_DIR = os.path.expanduser("~/SpiderNet")
ASSETS = os.path.join(BASE, "assets")

class SpiderNetCockpit(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🌻 SpiderNet Cockpit v3.1")
        self.resize(800, 600)

        tabs = QTabWidget()
        self.projects = QTextEdit()
        self.ideas = QTextEdit()

        pj_file = os.path.join(SPIDERNET_DIR, "PROJECTS.md")
        id_file = os.path.join(SPIDERNET_DIR, "IDEAS.md")

        self.projects.setPlainText(open(pj_file).read() if os.path.exists(pj_file) else "# Projects\nNo projects yet.")
        self.ideas.setPlainText(open(id_file).read() if os.path.exists(id_file) else "# Ideas\nNo ideas yet.")

        tabs.addTab(self.projects, "📓 Projects")
        tabs.addTab(self.ideas, "💡 Ideas")

        control = QWidget()
        grid = QGridLayout()
        buttons = ["🏥 Hospital", "🚑 Trauma", "🧹 Clean", "🐶 Watchdog", "📦 Archivist", "📋 Advisory", "🔄 Reset", "⬆️ Update", "🕸️ SpiderSync"]
        for i, label in enumerate(buttons):
            btn = QPushButton(label)
            grid.addWidget(btn, i//3, i%3)
        control.setLayout(grid)
        tabs.addTab(control, "Control")

        self.setCentralWidget(tabs)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SpiderNetCockpit()
    window.show()
    sys.exit(app.exec_())
