#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

mkdir -p scripts artifacts/runtime/spidernet/inventory .venv-tools

echo "=== VERIFY BASIC TOOLS ==="
command -v curl >/dev/null 2>&1 || { echo "curl missing"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 missing"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git missing"; exit 1; }

echo
echo "=== INSTALL OLLAMA IF NEEDED ==="
if ! command -v ollama >/dev/null 2>&1; then
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "ollama already installed"
fi

echo
echo "=== START OLLAMA IF NEEDED ==="
if curl -fsS http://127.0.0.1:11434 >/dev/null 2>&1; then
  echo "ollama already running"
else
  nohup ollama serve >/tmp/ollama_spidernet.log 2>&1 &
  sleep 6
fi

echo
echo "=== VERIFY OLLAMA ENDPOINT ==="
curl -fsS http://127.0.0.1:11434 >/tmp/ollama_probe.txt
echo "OLLAMA_ENDPOINT_OK"

echo
echo "=== PULL SAFE LOCAL CODING MODEL ==="
MODEL="qwen2.5-coder:7b"
ollama pull "$MODEL"

echo
echo "=== INSTALL AIDER IN LOCAL VENV ==="
python3 -m venv .venv-tools
source .venv-tools/bin/activate
python -m pip install --upgrade pip
python -m pip install aider-chat
deactivate

echo
echo "=== WRITE LOCAL CODING SCRIPTS ==="
cat > scripts/spidernet-local-code-status.sh <<'INNER'
#!/usr/bin/env bash
set -Eeuo pipefail
cd "$HOME/projects/spidernet-control-deck"

echo "=== LOCAL CODING STATUS ==="
if command -v ollama >/dev/null 2>&1; then
  echo "ollama: AVAILABLE"
  ollama --version || true
else
  echo "ollama: MISSING"
fi

echo
if curl -fsS http://127.0.0.1:11434 >/dev/null 2>&1; then
  echo "ollama endpoint: UP"
else
  echo "ollama endpoint: DOWN"
fi

echo
if [ -x ".venv-tools/bin/aider" ]; then
  echo "aider: AVAILABLE"
  .venv-tools/bin/aider --version || true
else
  echo "aider: MISSING"
fi

echo
echo "models:"
ollama list || true
INNER

cat > scripts/spidernet-local-code-start.sh <<'INNER'
#!/usr/bin/env bash
set -Eeuo pipefail
cd "$HOME/projects/spidernet-control-deck"

if ! curl -fsS http://127.0.0.1:11434 >/dev/null 2>&1; then
  nohup ollama serve >/tmp/ollama_spidernet.log 2>&1 &
  sleep 6
fi

export OLLAMA_API_BASE=http://127.0.0.1:11434
exec .venv-tools/bin/aider --model ollama_chat/qwen2.5-coder:7b
INNER

cat > scripts/spidernet-local-code-quickcheck.sh <<'INNER'
#!/usr/bin/env bash
set -Eeuo pipefail
cd "$HOME/projects/spidernet-control-deck"

echo "=== ROOT ==="
curl -I http://127.0.0.1:3000/ || true
echo
echo "=== INPUT DATA ==="
curl -I http://127.0.0.1:3000/boards/input-data || true
echo
echo "=== LOCAL CODING STATUS ==="
scripts/spidernet-local-code-status.sh
INNER

chmod +x scripts/spidernet-local-code-status.sh
chmod +x scripts/spidernet-local-code-start.sh
chmod +x scripts/spidernet-local-code-quickcheck.sh

echo
echo "=== WRITE LOCAL LANE INVENTORY ==="
cat > artifacts/runtime/spidernet/inventory/local_coding_lane_inventory.md <<'INNER'
# SpiderNet Local Coding Lane Inventory

## Real and working
- Ollama installed or verified
- Ollama endpoint verified at http://127.0.0.1:11434
- qwen2.5-coder:7b pulled locally
- Aider installed in .venv-tools
- scripts/spidernet-local-code-status.sh
- scripts/spidernet-local-code-start.sh
- scripts/spidernet-local-code-quickcheck.sh

## Inventory / not final truth
- No automatic provider failover yet
- No real live wiring from brain-manager to aider/ollama yet
- No Continue integration yet
- No Codex-local automatic switching yet
INNER

echo
echo "=== FINAL LOCAL STATUS ==="
scripts/spidernet-local-code-status.sh
echo
echo "LOCAL_BOOTSTRAP_OK"
