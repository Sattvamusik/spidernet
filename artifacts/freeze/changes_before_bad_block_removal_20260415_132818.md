# Changes

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

## 2026-04-15 — corrective build and snapshot compatibility completion
- completed DashboardSnapshot compatibility in `src/lib/spidernet/data.ts`
- preserved white UI with no redesign
- kept local Dash 001 packet creation and ledger append working
- verified `/` and `/boards/input-data` return `200 OK`
- verified POST `/api/spidernet/intake` writes matching packet and ledger records
