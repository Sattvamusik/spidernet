# Changes

## 2026-04-16 — Ollama runtime truth path restored
- changed Setu runtime storage to read the documented `artifacts/runtime/spidernet/config/ollama.json` path first
- kept backward compatibility through a legacy fallback to `artifacts/runtime/spidernet/registries/ollama.json`
- added the missing scaffold config file under `artifacts/runtime/spidernet/config/ollama.json`
- exposed the Ollama scaffold note in the dashboard so Brain posture does not imply live runtime proof

## 2026-04-16 — bridge continuity and Brain posture surfaced in white SETU
- added read-only freeze, mirror, and recovery status to the dashboard snapshot from the existing artifact trees
- added Brain posture status from the current runtime inventory and exposed it in the observatory
- added a new Bridge Continuity panel to the overview board
- preserved the white Setu UI and left Dash 001 intake behavior unchanged

## 2026-04-16 — white Setu verification-path hardening
- removed the remote Google font fetch path and preserved the same white Setu typography through local fallback stacks
- changed `npm run build` to `next build --webpack` so production builds pass in this sandbox
- added `.venv-tools/**` to ESLint ignores so lint stays focused on repo source
- tightened `src/lib/spidernet/data.ts` typing to clear lint and typecheck without changing behavior
- verified the built Dash 001 intake route still returns `303` and appends intake plus ledger records

## 2026-04-16 — Dash 001 local-only brain enforcement
- fixed the brain selector so `local_only` mode no longer silently falls back to a cloud tier when the local lane is unavailable
- updated the coding-flow preflight hold logic to include brain-lane enforcement
- preserved the white SETU UI and existing Dash 001 intake route shape

## 2026-04-15 — Dash 001 coding-flow outcome persistence
- added one append-only ledger event in the Dash 001 intake POST route so the coding-flow preflight result is stored as a structured local record
- kept the intake packet creation path intact
- preserved the POST `/api/spidernet/intake` `303` redirect behavior
- left the white SETU UI unchanged

## 2026-04-14 — white web dashboard architecture alignment
- kept the white web dashboard as the only product family and did not import the Tk visual styling
- updated shared types and architecture registry to make board names, short labels, exposure ladder, route model, and snapshot data explicit
- rebuilt the shell for a larger center workspace, compact left rail, and clearer right-side control cluster
- rewrote the overview and all six live board views for novice-first clarity and registry-driven workflow presentation
- preserved Dash 002 as research-only and kept manager logic explicit in Dash 003
- preserved durable local persistence and clarified live versus prepared paths in the Memory & Ledger board
- rewrote README to describe the white-web-first direction, exact board model, and live versus prepared state

## 2026-04-12
- initialized project from SpiderNet master vault
- added docs, plans, logs, tests, scripts, src, artifacts
- added editor and git hygiene files

## 2026-04-12 — all-in-one scaffold and verification
- scaffolded next.js app into repo
- installed dependencies
- verified localhost:3000
- saved first page snippet to artifacts/tmp

## 2026-04-14 — dashboard repair and unification
- replaced default starter page with a routed SpiderNet dashboard shell
- added central board registry, widget registry, and shared domain contracts
- added shared data and stubs for router, scorecard, policy, ledger, and safety gate
- implemented Input Data, Tools Store, and Hive Agents boards
- prepared routes and shells for SETU Bridge, Observatory, and Memory & Ledger
- refreshed favicon and launcher icon assets
- repaired build and open launcher scripts and desktop launcher settings
- rewrote README with exact run and validation steps

## 2026-04-14 — Phase 5 operating-law architecture port
- ported the DRISHTI Phase 5 operating-law architecture into the existing Next.js board family
- locked all six board purposes and kept Dash 002 research-only
- added four-lane model, route-family registry, packet-template registry, policy registry, and registry catalog
- added policy enforcement before routing with explicit software exposure decisions
- added Saarthi synthesis logic and Chitragupt readiness gates
- added live Dash 004 Specialist Task Execution, Dash 005 Observatory, and Dash 006 Memory & Ledger boards
- added durable file-backed storage for packets, vaults, wrappers, skills, score memory, ledger events, and Ollama prep config under `artifacts/runtime/spidernet`
- updated docs for architecture, runbook, setup, and troubleshooting

## 2026-04-15 — build hygiene and verified Dash 001 persistence
- excluded non-source folders like `artifacts` from TypeScript compilation
- restored compatibility storage exports for older packet route callers
- preserved the stable storage/data contract
- preserved the white UI without redesign
- verified `/` and `/boards/input-data` return `200 OK`
- verified POST `/api/spidernet/intake` writes intake and ledger records

## 2026-04-15 — verified SETU build hygiene and snapshot compatibility
- completed the current DashboardSnapshot compatibility bridge in `src/lib/spidernet/data.ts`
- excluded non-source backup folders from TypeScript compilation
- preserved the white UI with no redesign
- verified `/` and `/boards/input-data` return `200 OK`
- verified POST `/api/spidernet/intake` writes matching packet and ledger records
- recorded all temporary bridge fields and compatibility helpers in runtime inventory

## 2026-04-15 — Dash 001 intake flow wiring and launcher cleanup
- wired `src/lib/spidernet/coding-flow.ts` into the Dash 001 intake POST route as a non-blocking preflight step
- updated `scripts/spidernet-coding-launcher.sh` to resolve the repo root dynamically and prefer/report `.venv-tools/bin/aider`
- replaced the stale launcher `npm run intake:check` target with `scripts/spidernet-phase1-check.sh`
- verified targeted ESLint on the touched TypeScript files passed
- build remained blocked by Google Fonts fetches in the sandboxed environment
