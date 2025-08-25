#!/usr/bin/env python3
# 🌻 SpiderNet SpiderSync Agent v1.0
# Bridge service connecting SpiderNet, GPT, and external systems

import os, json, logging
from fastapi import FastAPI, Request
import uvicorn

BASE = os.path.expanduser("~/SpiderNet")
CONFIG = os.path.join(BASE, "Config", "spider.json")
LOGDIR = os.path.join(BASE, "Agents", "SpiderSync", "logs")
LOGFILE = os.path.join(LOGDIR, "spidersync.log")

os.makedirs(LOGDIR, exist_ok=True)

logging.basicConfig(filename=LOGFILE, level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(title="SpiderSync Agent", version="1.0")

def read_karma_manual():
    manual_path = os.path.join(BASE, "KarmaManual")
    if not os.path.isdir(manual_path):
        logging.error("KarmaManual missing at %s", manual_path)
        return "KarmaManual missing."
    texts = []
    files = sorted(os.listdir(manual_path))
    for f in files:
        if f.endswith(".md"):
            with open(os.path.join(manual_path, f), encoding="utf-8") as mf:
                texts.append(mf.read())
    return "\n\n".join(texts)

@app.on_event("startup")
def startup_event():
    logging.info("🌻 SpiderSync starting up...")
    # Ensure Config exists
    os.makedirs(os.path.dirname(CONFIG), exist_ok=True)
    if not os.path.isfile(CONFIG):
        with open(CONFIG, "w") as f:
            json.dump({"agents":[]}, f, indent=2)

@app.post("/ask")
async def ask(request: Request):
    data = await request.json()
    query = data.get("query", "")
    manual = read_karma_manual()
    enriched = f"KarmaManual:\n{manual}\n\nUser Query:\n{query}"
    logging.info("Received query: %s", query)
    return {"enriched_query": enriched}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8792)
