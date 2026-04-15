# Runbook

## Start
1. Open a terminal.
2. Go to the repo:
   `cd /home/sattv/projects/spidernet-control-deck`
3. Install dependencies if needed:
   `npm install`
4. Start the app:
   `npm run dev`

## Stop
- Press `Ctrl+C` in the terminal running `npm run dev`.

## Validation commands
- lint: `npm run lint`
- build: `npm run build`

## Runtime paths
- app URL: `http://127.0.0.1:3000`
- durable runtime storage root: `artifacts/runtime/spidernet`
- packet storage: `artifacts/runtime/spidernet/packets`
- registry storage: `artifacts/runtime/spidernet/registries`
- vault storage: `artifacts/runtime/spidernet/vaults`
- ledger storage: `artifacts/runtime/spidernet/ledger`
- Ollama prep config: `artifacts/runtime/spidernet/config/ollama.json`

## Smoke check
1. Run `npm run dev`.
2. Confirm the terminal shows `Ready`.
3. Open `http://127.0.0.1:3000`.
4. Confirm the overview page loads.
5. Open each board route from the shell rail.
6. Confirm `npm run lint` passes.
7. Confirm `npm run build` passes.

## Operational notes
- The web shell is the main product.
- DRISHTI is architecture reference only.
- Dash 002 stays research-only.
- Manual hold is the fallback when a wrapper path is not live.
