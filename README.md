# SpiderNet Control Deck

## What this project does
SpiderNet Control Deck is an internal web-based operations console intended to give a clean view into SpiderNet system status, services, health, execution flow, and controlled operations from a disciplined project foundation.

## Who this is for
internal ops team

## Current phase
Phase 01 — Foundation

## Project structure
- `src/` application code
- `scripts/` helper scripts
- `tests/` tests and smoke checks
- `docs/` architecture, setup, runbook, troubleshooting
- `plans/` backlog, current phase, FTD
- `logs/` worklog and change log
- `artifacts/` screenshots, outputs, generated files

## Quick start
### Install
npm install

### Run locally
npm run dev

### Build
npm run build

### Test
npm test

## Safety notes
- Real secrets are not stored in the repo.
- Use `.env.example` as reference only.
- Read `docs/runbook.md` before risky operations.

## Status
- [x] project structure created
- [ ] local run verified
- [ ] tests verified
- [ ] docs verified

## Scaffold status
- Next.js scaffold merged on 2026-04-12
- Node 20 used through nvm
