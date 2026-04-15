# Setup

## Prerequisites
- Node.js 20+
- npm
- a writable project checkout at `/home/sattv/projects/spidernet-control-deck`

## Initial setup
1. Go to the repo:
   `cd /home/sattv/projects/spidernet-control-deck`
2. Install dependencies:
   `npm install`
3. Start local development:
   `npm run dev`
4. Open `http://127.0.0.1:3000`

## Optional local model prep
- Ollama endpoint default: `http://127.0.0.1:11434`
- Ollama prep file: `artifacts/runtime/spidernet/config/ollama.json`
- Current status is prepared only until a real local endpoint is verified.

## Validation
- `npm run lint`
- `npm run build`
- verify the app starts on port 3000
- verify runtime files are created under `artifacts/runtime/spidernet`
