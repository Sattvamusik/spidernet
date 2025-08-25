#!/usr/bin/env python3
# 🌻 SpiderNet Cockpit Starter
# Simple PyQt5 GUI with Projects + Ideas tabs

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
#!/usr/bin/env python3
# 🌻 SpiderNet Cockpit Starter
# Simple PyQt5 GUI with Projects + Ideas tabs

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
#!/usr/bin/env python3
print("🌻 Cockpit dashboard placeholder — future GUI here")
