# Worklog

## 2026-04-14 — white web dashboard alignment and architecture import
### Done
- Kept the current white web dashboard family as the only UI direction and did not port the dark Tk desktop styling.
- Tightened the shared architecture model to make the six locked boards, four lanes, packet flow, vault routing, exposure ladder, Saarthi synthesis, and Chitragupt gates explicit.
- Reworked the shell for a larger center stage, compact left rail, and clearer right-side control cluster while preserving the existing white layout.
- Rebuilt all six board views around the registry-driven operating model and novice-first wording.
- Kept Dash 002 research-only and preserved local persistence under `artifacts/runtime/spidernet`.
- Updated README, worklog, changes, and FTD to match the current live state.

### Verified
- `npm run lint` passed.
- `npm run build` passed.
- `npm run dev -- --hostname 0.0.0.0 --port 3000` started successfully.
- `curl -I http://127.0.0.1:3000` returned `HTTP/1.1 200 OK`.

### Active
- White web SETU remains the live operating surface.

### Remaining
- Add mutation paths for packet updates if the dashboard needs live editing from the UI.
- Decide when, if ever, browser automation and desktop automation should move from prepared to live.

### Risks / blockers
- Ollama remains prepared only.
- Browser automation and desktop automation remain prepared exposure paths, not active integrations.

## 2026-04-12
### Done
- Created project from SpiderNet Master Bootstrap Copier v2-fixed.

### Verified
- Base structure, templates, and starter governance files created.

### Active
- Foundation is ready for stack scaffold and local run.

### Remaining
- Review AGENTS.md and README.md
- Scaffold the chosen stack
- Verify local app/service run

## 2026-04-12 — all-in-one scaffold and verification
### Done
- Activated Node 20 with nvm.
- Created clean temporary Next.js scaffold.
- Merged scaffold into project repo.
- Installed dependencies.
- Started local server and verified localhost:3000.
- Saved first HTML snippet to artifacts/tmp/first-page-snippet.html.

### Verified
- Local app verification completed at 2026-04-12 22:36:30.
- HTTP check for localhost:3000 succeeded.

### Active
- Project now has a real Next.js foundation and a verified local run path.

### Remaining
- Replace default Next.js page with real SpiderNet Control Deck UI.
- Add first smoke test script.
- Build dashboard shell.

### Risks / blockers
- Test script is not defined in package.json yet.

## 2026-04-14 — dashboard unification and completion
### Done
- Replaced the default Next.js starter with a routed SpiderNet dashboard shell.
- Centralized board metadata, icons, routes, ordering, visibility, and widget registration.
- Implemented Dash 001 Input Data, Dash 002 Tools Store, and Dash 003 Hive Agents.
- Prepared Dash 004 SETU Bridge, Dash 005 Observatory, and Dash 006 Memory & Ledger with route shells.
- Added shared typed contracts and stubs for router, scorecard, policy, ledger, and safety gate.
- Repaired launcher scripts, desktop launcher behavior, and favicon assets.

### Verified
- Registry-backed routes now exist for overview and all six boards.
- Launcher scripts no longer depend on a codex-only finisher path.

### Active
- Final validation through lint, build, and live local run.

### Remaining
- Confirm lint, build, and browser response on the final dashboard implementation.

### Risks / blockers
- No dedicated automated test script exists yet in `package.json`.

## 2026-04-14 — Phase 5 operating-law port and Phase 6 durability
### Done
- Imported the Phase 5 operating-law architecture from the DRISHTI desktop line into the existing web SETU repo without creating a second dashboard family.
- Replaced placeholder board contracts with the locked six-board model, four-lane model, route families, typed packet templates, and policy-before-routing logic.
- Converted Dash 004, Dash 005, and Dash 006 from prepared shells into live web boards while preserving the current shell and center-stage layout.
- Added durable local runtime storage under `artifacts/runtime/spidernet` for packets, vaults, registries, ledger events, and Ollama prep config.
- Added real wrapper registry linkage, skill registry records, score-memory storage, Saarthi synthesis, and Chitragupt readiness gates.
- Updated architecture, runbook, setup, and troubleshooting docs to match the current implementation state.

### Verified
- `npm run lint` passed.
- `npm run build` passed.
- `npm run dev` started successfully and served `http://127.0.0.1:3000`.
- `curl -I http://127.0.0.1:3000` returned `HTTP/1.1 200 OK`.

### Active
- Web SETU repo is now the main operating surface.

### Remaining
- Add a dedicated automated smoke or test script to `package.json`.
- Decide when to upgrade prepared exposure paths to live.
- Wire a real Ollama handshake only after local endpoint confirmation.

### Risks / blockers
- Ollama is prepared only and is not live.
- Browser automation and desktop automation remain prepared exposure paths, not active integrations.

## 2026-04-15 — stable SETU contract, build hygiene, and live Dash 001 intake
### Done
- Excluded non-source backup and vault folders from TypeScript compilation so frozen artifacts do not break the app build.
- Restored compatibility exports in `src/lib/spidernet/storage.ts` for older packet route callers while keeping the new stable storage/data contract.
- Kept the white SETU UI unchanged.
- Preserved and verified the live Dash 001 intake write path to `artifacts/runtime/spidernet/packets/intake.json`.
- Preserved and verified the append-only ledger write path to `artifacts/runtime/spidernet/ledger/events.json`.

### Verified
- `npm run build` passed.
- `curl -I http://127.0.0.1:3000/` returned `HTTP/1.1 200 OK`.
- `curl -I http://127.0.0.1:3000/boards/input-data` returned `HTTP/1.1 200 OK`.
- POST to `/api/spidernet/intake` created matching intake and ledger records.

### Active
- White SETU remains the live operating surface with stable local Dash 001 intake persistence.

### Remaining
- Wire harnessing, Socrates validation, Chanakya permission checks, and brain-manager fallback into the core flow.
- Add auth and stronger mutation-route protection before expanding write paths.

### Risks / blockers
- None for the current local packet creation path.

## 2026-04-15 — corrective verification for SETU contract and Dash 001 intake
### Done
- Completed the DashboardSnapshot compatibility layer in `src/lib/spidernet/data.ts` so the current board components and routes receive the fields they expect.
- Kept the white SETU UI unchanged.
- Preserved the stable local intake packet write path and append-only ledger write path.

### Verified
- `npm run build` passed after excluding backup folders from compilation and completing the snapshot contract.
- `curl -I http://127.0.0.1:3000/` returned `HTTP/1.1 200 OK`.
- `curl -I http://127.0.0.1:3000/boards/input-data` returned `HTTP/1.1 200 OK`.
- POST to `/api/spidernet/intake` created matching intake and ledger records.

### Active
- Dash 001 intake creation is live and locally persisted.

### Remaining
- Replace compatibility fields with tighter typed domain models board-by-board.
- Add harnessing, Socrates validation, Chanakya permission checks, and brain-manager fallback.

### Risks / blockers
- Current snapshot compatibility uses safe fallback arrays for fields not yet fully modeled.
