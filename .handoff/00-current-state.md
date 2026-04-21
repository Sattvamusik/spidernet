# Current State

## Repo
- Code repo: /home/sattv/projects/spidernet-control-deck
- Context workspace: /home/sattv/SpiderNet_Control/08_HIVE/DRISHTI
- Branch: fix/setu-storage-data-contract-001
- HEAD: 2995a58

## Latest commits (at HEAD)
- 2995a58 — Bridge: add cache-hit case to smoke-ai-handoff
- 110e3a3 — Bridge: add failure-path case to smoke-ai-handoff
- 54b0e53 — Bridge: add smoke-ai-handoff script
- 086c454 — Handoff: refresh metadata-only packet after Provider B
- aa65587 — AI Handoff Provider B: add fetch-based Anthropic provider with failure taxonomy
- 21ee7be — AI Handoff Provider A: async refactor and rename payload to AIHandoffPayloadV1
- 67b4138 — Handoff: refresh resume state and record preserved lanes at 62fc21e
- 62fc21e — cleanup(spidernet): remove brain status compatibility bridge

## Verified checks at HEAD 2995a58 (2026-04-18T13:00:54+05:30)
- npm run lint ✅
- npx tsc --noEmit ✅
- npm run build ✅
- npm run smoke:ai-handoff ✅ (38/38 cases: stub-success + failure-path + cache-hit)

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
- Bridge dispatch pipeline (committed): Ingest v1 → Filtration Routing v1 → Memory Feed v1 → FTD Workflow v1 → FTD Dispatch v1 → AI Handoff Provider A+B (real Anthropic via `fetch`, stub fallback)
- AI Handoff payload: canonical `AIHandoffPayloadV1` used end-to-end; provider layer at `src/lib/spidernet/ai-providers.ts`; env selector `AI_HANDOFF_PROVIDER` (`stub` default, `anthropic` opt-in)
- Bridge board: `src/app/boards/[slug]/page.tsx` slug `setu-bridge` → `SpecialistTaskBoard`
- Policy routing: `src/lib/spidernet/policy.ts:144` — build-class packets → `dash-004-setu-bridge`
- Ownership split: `docs/architecture/setu-mine-vs-bridge.md` (committed in 67b4138) — Launcher = access; Bridge = logic
- Bridge smoke suite: `scripts/smoke-ai-handoff.ts` (tsx dev-dep); `npm run smoke:ai-handoff` runs 38 offline assertions over the full `sent.json` state machine — stub-success writes cache, failure-path leaves cache clean and retries on next dispatch, cache-hit returns `duplicate:true` without rewriting the attempt file

## Preserved lanes (git stashes, not committed — do NOT mix)
- `stash wip/launcher-button` — Ubuntu Terminal Launcher track (NOT Bridge); floating SETU button in `layout.tsx`. Resume under Launcher thread.

## Residual working tree
- `M tsconfig.tsbuildinfo` — build artifact, regenerates

## Next recommended step
- SETU Bridge work for this thread is complete
- Launcher-button work belongs to a separate Ubuntu Terminal Launcher thread — do not start it in a Bridge thread
- Any new Bridge-side follow-up should be a fresh small packet with explicit scope

## 2026-04-21 update

- P-LAUNCH-DESKTOP-01 anchored in repo as `scripts/create_desktop_launcher.sh` + `scripts/launch-dashboard.sh`
- Desktop icons materialized at `~/Desktop/DRISHTI-Dashboard.desktop` and `/mnt/c/Users/sattv/Desktop/DRISHTI Dashboard.cmd`
- start-app.sh remains at its DRISHTI absolute path (reference-only — not imported)
- Not yet committed
