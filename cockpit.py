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
