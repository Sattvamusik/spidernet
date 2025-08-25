#!/usr/bin/env python3
# 🌻 SpiderNet Cockpit v2 — Dynamic Dashboard with ManualReader check

import os, sys, subprocess, tkinter as tk

# === Run ManualReader first ===
def run_manualreader():
    base = os.path.expanduser("~/SpiderNet/agents/ManualReader")
    sh_path = os.path.join(base, "ManualReader.sh")
    ps_path = os.path.join(base, "ManualReader.ps1")

    if os.path.exists(sh_path):
        subprocess.call(["bash", sh_path])
    elif os.path.exists(ps_path):
        # prefer pwsh if available
        if subprocess.call(["which", "pwsh"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0:
            subprocess.call(["pwsh", "-File", ps_path])
        else:
            subprocess.call(["powershell", "-File", ps_path])
    else:
        print("⚠️ ManualReader not found — proceeding anyway (NOT RECOMMENDED)")

# Run before GUI starts
run_manualreader()

# === GUI Code (unchanged) ===
BG_COLOR = "#fffbea"
BTN_COLOR = "#ffe066"
TEXT_COLOR = "#333333"

root = tk.Tk()
root.title("🌻 SpiderNet Cockpit v2")
root.configure(bg=BG_COLOR)
root.geometry("800x600")

# ... rest of Cockpit code as before ...
#!/usr/bin/env python3
# 🌻 SpiderNet Cockpit v2 — Dynamic Dashboard

import os
import tkinter as tk

# 🌻 Theme Colors
BG_COLOR = "#fffbea"         
BTN_COLOR = "#ffe066"        
TEXT_COLOR = "#333333"

root = tk.Tk()
root.title("🌻 SpiderNet Cockpit v2")
root.configure(bg=BG_COLOR)
root.geometry("800x600")

# 📌 Core Agents
core_agents = {
    "🏥 Hospital (Diagnostics)": "hospital.sh",
    "🚑 Trauma (Repairs)": "trauma.sh",
    "🧹 Cleaner (Organize Desktop)": "cleaner.sh",
    "👁️ Watchdog (Auto-Heal)": "watchdog.sh",
    "📜 Archivist (Logs + Projects)": "archivist.sh",
    "💡 Advisory (Ideas)": "advisory.sh",
    "🔄 Reset": "reset.sh",
    "🌻 Update": "update.sh"
}

def get_dynamic_tools():
    tools_dir = os.path.expanduser("~/.spidernet/tools")
    os.makedirs(tools_dir, exist_ok=True)
    return [f for f in os.listdir(tools_dir) if f.endswith(".sh")]

def run_tool(script):
    os.system(f"bash {script}")

def make_button(frame, text, script):
    btn = tk.Button(
        frame, text=text, bg=BTN_COLOR, fg=TEXT_COLOR,
        relief="raised", bd=2, padx=12, pady=6,
        font=("Arial", 12, "bold"),
        command=lambda: run_tool(script)
    )
    btn.pack(pady=5, fill="x")

# Frames
frame_core = tk.LabelFrame(root, text="🌻 Core Agents", bg=BG_COLOR, font=("Arial", 14, "bold"))
frame_core.pack(fill="both", expand=True, padx=15, pady=10)

frame_dyn = tk.LabelFrame(root, text="⚡ Dynamic Tools", bg=BG_COLOR, font=("Arial", 14, "bold"))
frame_dyn.pack(fill="both", expand=True, padx=15, pady=10)

# Add core buttons
for label, script in core_agents.items():
    make_button(frame_core, label, script)

# Add dynamic buttons
for script in get_dynamic_tools():
    make_button(frame_dyn, f"🔧 {script.replace('.sh','')}", f"~/.spidernet/tools/{script}")

root.mainloop()
