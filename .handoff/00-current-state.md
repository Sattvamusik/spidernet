# Current State

## Repo
- Code repo: /home/sattv/projects/spidernet-control-deck
- Context workspace: /home/sattv/SpiderNet_Control/08_HIVE/DRISHTI
- Branch: fix/setu-storage-data-contract-001
- HEAD: 62fc21e

## Latest commits (at HEAD)
- 62fc21e — cleanup(spidernet): remove brain status compatibility bridge
- 6bb7fcd — AI Handoff v1: add controlled cached handoff from downstream packets
- e2060e4 — FTD Dispatch v1: consume workflow seeds and append downstream packet records
- 66a6676 — FTD Workflow v1: seed workflows from accepted routed packets
- 4549f5b — Memory Feed v1: persist accepted routed packet summaries
- 3374086 — Filtration Routing v1: classify ingest packets and persist route decisions

## Verified checks at HEAD 62fc21e (2026-04-18T01:48:05+05:30)
- npm run lint ✅
- npx tsc --noEmit ✅
- npm run build ✅

## Locked rules
- Brain v1 is read-only
- No setTierPosture()
- No brain-manager changes
- No intake changes
- No mission writing
- No Ollama handshake work
- No specialist registry work
- SETU Bridge track = dashboard `dash-004-setu-bridge` pipeline only
- Exclude DRISHTI `setu-launcher-node` runtime
- Exclude operator-bay pane launcher / Ubuntu Terminal Launcher

## Current architecture truth
- Brain v2 write path + admin posture route landed (Phases 2a..2d-2)
- Snapshot exposes `brainPosture` as the sole structured brain surface
- Compatibility bridge (BrainStatus / brainStatus / brainSignals) retired via 62fc21e (C-1..C-5)
- Observatory: file-backed posture renders; Ollama row reads `ollamaConfig` directly; Guardrail row reads `continuityStatus.guardrailNote`
- Bridge dispatch pipeline (committed): Ingest v1 → Filtration Routing v1 → Memory Feed v1 → FTD Workflow v1 → FTD Dispatch v1 → AI Handoff v1 (stub)
- Bridge board: `src/app/boards/[slug]/page.tsx` slug `setu-bridge` → `SpecialistTaskBoard`
- Policy routing: `src/lib/spidernet/policy.ts:144` — build-class packets → `dash-004-setu-bridge`
- Ownership split (`docs/architecture/setu-mine-vs-bridge.md`, untracked): Launcher = access; Bridge = logic

## Preserved lanes (git stashes, not committed — do NOT mix)
- `stash wip/ai-handoff-provider` — Bridge track; real AI provider call; blocked on missing `src/lib/spidernet/ai-providers.ts` and `@anthropic-ai/sdk` dep approval
- `stash wip/launcher-button` — Launcher track (NOT Bridge); floating SETU button in `layout.tsx`
- `stash wip/handoff-refresh` — stale precursor superseded by this rewrite; discardable after acceptance

## Residual working tree
- `M tsconfig.tsbuildinfo` — build artifact, regenerates
- `?? docs/architecture/setu-mine-vs-bridge.md` — untracked ownership charter

## Next recommended step
- Await scope approval on each preserved lane
- No new code packet until a lane is approved
- Once approved, resume one lane at a time
