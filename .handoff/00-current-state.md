# Current State

## Repo
- Code repo: /home/sattv/projects/spidernet-control-deck
- Context workspace: /home/sattv/SpiderNet_Control/08_HIVE/DRISHTI
- Branch: fix/setu-storage-data-contract-001
- HEAD: 037c786

## Latest verified commits
- ca9cf46 — Brain v2: atomic posture write primitive (Phase 2a)
- 1bf8a8b — Brain v2: posture change ledger emitter (Phase 2b)
- c56e051 — Brain v2: wire setTierPosture to write and ledger emit (Phase 2c)
- 037c786 — Handoff: refresh after Phase 2c

## Verified checks (against HEAD 037c786)
- npm run lint ✅
- npx tsc --noEmit ✅
- npm run build ✅

## Locked rules still in force
- No brain-manager changes
- No intake changes
- No mission writing
- No Ollama handshake work
- No specialist registry work
- Atomic write required (enforced by storage.ts)
- Corruption = throw; schema mismatch = hard fail
- Timestamps live in posture.ts, not storage.ts

## Current architecture truth
- `src/lib/spidernet/brain/storage.ts`:
  - `readPostureFile()` (Phase 1)
  - `writePostureFile()` atomic temp-write + rename (Phase 2a)
  - `BrainPostureReadError`, `BrainPostureWriteError`
- `src/lib/spidernet/brain/events.ts`:
  - `emitPostureChangeEvent()` wraps `appendLedgerEvent` (Phase 2b)
  - `BrainPostureLedgerEmitError` carries event payload for retry
- `src/lib/spidernet/brain/posture.ts`:
  - `loadPosture()`, `getTierPosture()` (Phase 1)
  - `setTierPosture(tier, { status, note })` wired to write + ledger (Phase 2c)
  - Idempotency key = sha256(tier, status, note, timestamp)
- No caller of `setTierPosture` exists yet. Brain module has no outside invocation.
- Observatory board still reads file-backed posture via snapshot (Phase 1 path).
- `brainStatus`/`brainPosture` compatibility bridge still present.

## Working tree
- Dirty only: `next-env.d.ts`, `tsconfig.tsbuildinfo` (generated)

## Next recommended step
- Phase 2d — design (first). Choose the first real caller of `setTierPosture`:
  probe loop, manual admin route, or probe API. Design only; no implementation yet.
