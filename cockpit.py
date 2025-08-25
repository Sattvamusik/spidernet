#!/usr/bin/env python3
# 🌻 SpiderNet Cockpit v1
# Visible desktop dashboard with auto-refresh tabs

import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QTextEdit, QTabWidget, QWidget, QVBoxLayout, QLabel, QTimer

class Cockpit(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🕸️ SpiderNet Cockpit")
        self.resize(900, 600)

        self.tabs = QTabWidget()

        # --- Projects Tab ---
        self.projects_text = QTextEdit()
        self.projects_text.setReadOnly(True)
        self.load_file("PROJECTS.md", self.projects_text)
        projects_tab = QWidget()
        layout1 = QVBoxLayout()
        layout1.addWidget(self.projects_text)
        projects_tab.setLayout(layout1)
        self.tabs.addTab(projects_tab, "📂 Projects")

        # --- Ideas Tab ---
        self.ideas_text = QTextEdit()
        self.ideas_text.setReadOnly(True)
        self.load_file("IDEAS.md", self.ideas_text)
        ideas_tab = QWidget()
        layout2 = QVBoxLayout()
        layout2.addWidget(self.ideas_text)
        ideas_tab.setLayout(layout2)
        self.tabs.addTab(ideas_tab, "💡 Ideas")

        self.setCentralWidget(self.tabs)

        # --- Auto-refresh every 5s ---
        self.timer = QTimer()
        self.timer.timeout.connect(self.refresh_tabs)
        self.timer.start(5000)

    def load_file(self, filename, widget):
        try:
            with open(filename, "r") as f:
                widget.setPlainText(f.read())
        except FileNotFoundError:
            widget.setPlainText(f"{filename} not found")

    def refresh_tabs(self):
        self.load_file("PROJECTS.md", self.projects_text)
        self.load_file("IDEAS.md", self.ideas_text)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    cockpit = Cockpit()
    cockpit.show()
    sys.exit(app.exec_())
curl -fsSL https://raw.githubusercontent.com/sattvamusik/spidernet/main/install.sh | bash
source ~/.bashrc
spn cockpit
#!/usr/bin/env python3
# 🌻 SpiderNet Cockpit with Auto-Refresh
# PyQt5 GUI with Projects + Ideas tabs (auto-linked to ~/.spidernet/)

import sys, os
from PyQt5.QtWidgets import QApplication, QMainWindow, QTextEdit, QTabWidget, QWidget, QVBoxLayout
from PyQt5.QtCore import QTimer

BASE = os.path.expanduser("~/.spidernet")

class Cockpit(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🌻 SpiderNet Cockpit")
        self.resize(900, 700)

        self.tabs = QTabWidget()

        # --- Projects Tab ---
        self.projects_text = QTextEdit()
        self.projects_text.setReadOnly(True)
        self.load_file(os.path.join(BASE, "PROJECTS.md"), self.projects_text)

        projects_tab = QWidget()
        layout1 = QVBoxLayout()
        layout1.addWidget(self.projects_text)
        projects_tab.setLayout(layout1)
        self.tabs.addTab(projects_tab, "📂 Projects")

        # --- Ideas Tab ---
        self.ideas_text = QTextEdit()
        self.ideas_text.setReadOnly(True)
        self.load_file(os.path.join(BASE, "IDEAS.md"), self.ideas_text)

        ideas_tab = QWidget()
        layout2 = QVBoxLayout()
        layout2.addWidget(self.ideas_text)
        ideas_tab.setLayout(layout2)
        self.tabs.addTab(ideas_tab, "💡 Ideas")

        self.setCentralWidget(self.tabs)

        # --- Auto-refresh every 5 seconds ---
        self.timer = QTimer()
        self.timer.timeout.connect(self.refresh_files)
        self.timer.start(5000)  # 5000 ms = 5 seconds

    def load_file(self, filepath, widget):
        try:
            with open(filepath, "r") as f:
                widget.setPlainText(f.read())
        except FileNotFoundError:
            widget.setPlainText(f"{os.path.basename(filepath)} not found")

    def refresh_files(self):
        self.load_file(os.path.join(BASE, "PROJECTS.md"), self.projects_text)
        self.load_file(os.path.join(BASE, "IDEAS.md"), self.ideas_text)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    cockpit = Cockpit()
    cockpit.show()
    sys.exit(app.exec_())
#!/usr/bin/env python3
# 🌻 SpiderNet Cockpit
# PyQt5 GUI with Projects + Ideas tabs (auto-linked to ~/.spidernet/)

import sys, os
from PyQt5.QtWidgets import QApplication, QMainWindow, QTextEdit, QTabWidget, QWidget, QVBoxLayout

BASE = os.path.expanduser("~/.spidernet")

class Cockpit(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🌻 SpiderNet Cockpit")
        self.resize(900, 700)

        tabs = QTabWidget()

        # --- Projects Tab ---
        self.projects_text = QTextEdit()
        self.projects_text.setReadOnly(True)
        self.load_file(os.path.join(BASE, "PROJECTS.md"), self.projects_text)

        projects_tab = QWidget()
        layout1 = QVBoxLayout()
        layout1.addWidget(self.projects_text)
        projects_tab.setLayout(layout1)
        tabs.addTab(projects_tab, "📂 Projects")

        # --- Ideas Tab ---
        self.ideas_text = QTextEdit()
        self.ideas_text.setReadOnly(True)
        self.load_file(os.path.join(BASE, "IDEAS.md"), self.ideas_text)

        ideas_tab = QWidget()
        layout2 = QVBoxLayout()
        layout2.addWidget(self.ideas_text)
        ideas_tab.setLayout(layout2)
        tabs.addTab(ideas_tab, "💡 Ideas")

        self.setCentralWidget(tabs)

    def load_file(self, filepath, widget):
        try:
            with open(filepath, "r") as f:
                widget.setPlainText(f.read())
        except FileNotFoundError:
            widget.setPlainText(f"{os.path.basename(filepath)} not found in {filepath}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    cockpit = Cockpit()
    cockpit.show()
    sys.exit(app.exec_())
#!/usr/bin/env python3
# 🌻 SpiderNet Cockpit Starter (PyQt5 GUI)

import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QTextEdit, QTabWidget, QWidget, QVBoxLayout

class Cockpit(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🌻 SpiderNet Cockpit")
        self.resize(800, 600)

        tabs = QTabWidget()

        # --- Projects Tab ---
        self.projects_text = QTextEdit()
        self.projects_text.setReadOnly(True)
        self.load_file("PROJECTS.md", self.projects_text)
        projects_tab = QWidget()
        layout1 = QVBoxLayout()
        layout1.addWidget(self.projects_text)
        projects_tab.setLayout(layout1)
        tabs.addTab(projects_tab, "📂 Projects")

        # --- Ideas Tab ---
        self.ideas_text = QTextEdit()
        self.ideas_text.setReadOnly(True)
        self.load_file("IDEAS.md", self.ideas_text)
        ideas_tab = QWidget()
        layout2 = QVBoxLayout()
        layout2.addWidget(self.ideas_text)
        ideas_tab.setLayout(layout2)
        tabs.addTab(ideas_tab, "💡 Ideas")

        self.setCentralWidget(tabs)

    def load_file(self, filename, widget):
        try:
            with open(filename, "r") as f:
                widget.setPlainText(f.read())
        except FileNotFoundError:
            widget.setPlainText(f"{filename} not found")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    cockpit = Cockpit()
    cockpit.show()
    sys.exit(app.exec_())
