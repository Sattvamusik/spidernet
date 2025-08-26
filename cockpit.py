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
