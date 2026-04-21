# Recovery

Last reviewed: 2026-04-21
Project: spidernet-control-deck

## Start the app

`launcher/scripts/start-app.sh` does not exist in this repo yet. The known-good copy lives at:

    /home/sattv/SpiderNet_Control/08_HIVE/DRISHTI/launcher/scripts/start-app.sh

Caveat: that path is outside the deck repo and is not anchored here by git. Treat it as external reference until a packet imports it.

## Check health

    curl -fsS http://127.0.0.1:3000/api/health

## Start Ollama (if not running)

    setu ollama-start

## Recreate desktop launcher

    cd /home/sattv/projects/spidernet-control-deck
    ./scripts/create_desktop_launcher.sh
