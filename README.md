# SpiderNet Control Deck

SpiderNet Control Deck is the white web SETU dashboard for SpiderNet internal operations. The dark DRISHTI desktop line is used here only as an architecture reference. Its visual styling is not ported into this repo.

## Product direction
- Main UI: white web dashboard
- Preserved: compact left rail, center-stage layout, cleaner shell
- Improved for this phase: larger working area, clearer right-side control cluster, simpler board language, better spacing, stronger novice-first flow

## Locked board model
- `Dash 001 SETU Input Terminal`
- `Dash 002 Research Tools`
- `Dash 003 Hive Orchestrator`
- `Dash 004 Specialist Task Execution`
- `Dash 005 Observatory`
- `Dash 006 Memory & Ledger`

## Ported architecture
- locked six-board purpose model
- four-lane model
- typed packet model
- policy-before-routing
- vault routing model
- Saarthi manager synthesis logic
- Chitragupt readiness gates
- wrapper registry
- skill registry
- tool score memory
- software exposure decision ladder:
  - `API`
  - `CLI`
  - `browser automation`
  - `desktop automation`
  - `manual hold`

## Live now
- white web dashboard shell and all six web boards
- research-only lock on Dash 002
- registry-driven architecture in `src/lib/spidernet`
- durable local persistence under `artifacts/runtime/spidernet`
- local packet, vault, ledger, wrapper, skill, and score-memory reads
- policy routing preview and manager synthesis
- lint, build, and local dev boot flow

## Prepared only
- browser automation wrapper path
- desktop automation wrapper path
- live Ollama handshake

## Exact local run steps
1. Install dependencies:
   `npm install`
2. Start the app on the stable default port:
   `npm run dev -- --hostname 0.0.0.0 --port 3000`
3. Open:
   `http://127.0.0.1:3000`

## Validation commands
- `npm run lint`
- `npm run build`

## Project structure
- `src/app/`: routes and app shell
- `src/components/spidernet/`: white dashboard shell and board views
- `src/lib/spidernet/`: architecture, policy, routing, storage, and registry contracts
- `artifacts/runtime/spidernet/`: durable local packet, registry, vault, ledger, and config data
- `docs/`: architecture and operating notes
- `logs/`: worklog and change log
- `plans/`: current and future work tracking
- `scripts/`: launcher and repair helpers

## Current status
- Main product family is the white web dashboard.
- DRISHTI desktop logic has been ported as workflow architecture only.
- Build and run flow remain working.
