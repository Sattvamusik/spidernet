# Brain Write-Path — Design (v2)

Status: **Design only. No implementation.**
Scope: plan for introducing posture writes on top of the Brain v1 read-only scaffold without violating read/write separation, Chitragupta state-change logging, atomic-storage rules, or existing Brain v1 guarantees.

Governing locked decisions (from `.handoff/01-decisions.md`):
1. Option B — Brain v1 is read-only today.
2. Corruption: throw, no silent recovery.
3. Schema mismatch: hard fail.
4. Timestamps live in `posture.ts`, not `storage.ts`.
5. Atomic write required for any future write path.
6. Compatibility bridge between `brainStatus` and `brainPosture` is allowed temporarily.

This document does not change the current repo. Every component described here is future work.

## 1. Required write-path components

- **I/O primitive** in `src/lib/spidernet/brain/storage.ts` — new `writePostureFile(snapshot)`. Pure serialization. Writes to a temp file, then `fs.renameSync` onto the target path (atomic on the same filesystem). Re-uses the existing `validateSnapshot` so invalid data cannot persist. No timestamps. No ledger side effects.
- **Operation API** in `src/lib/spidernet/brain/posture.ts` — new `setTierPosture(tier, { status, note })`. Only public mutation entry point. Reads current snapshot, mutates one tier, stamps timestamps (per Locked Decision #4), calls `writePostureFile`, then calls the ledger emitter. Returns the new snapshot.
- **Ledger bridge** in new `src/lib/spidernet/brain/events.ts` — `emitPostureChangeEvent(change)`. Isolates the brain module's single authorized outside-module dependency (the ledger) behind one function. Tests can stub this.
- **Error surface** — `BrainPostureWriteError`, `BrainPostureLedgerEmitError`. `BrainPostureReadError` already exists from Phase 1 and is unchanged.
- **Possible ledger API addition** in `src/lib/spidernet/ledger.ts` — `appendLedgerEvent(event)` must exist as an export. Verify before Phase 2b; if absent, that export is added as part of 2b.

## 2. Where ledger emission happens

Inside `setTierPosture`, **after a successful atomic write, before returning.**

Ledger emission is the brain module's only authorized side effect outside itself. It lives in `brain/events.ts` so the mutation path (`posture.ts`) and the audit path (`events.ts`) remain separable and independently testable.

## 3. Should `setTierPosture` exist, and where

Yes. In `src/lib/spidernet/brain/posture.ts`, co-located with the existing `loadPosture` and `getTierPosture`. This keeps the brain module's public surface in one file. Any caller outside `brain/` goes through this function. A module-level comment in `storage.ts` discourages direct `writePostureFile` imports from outside `brain/`.

## 4. Storage / ledger call order

```
setTierPosture(tier, { status, note }):
  ts      = ISO timestamp                            # single time source per call
  current = readPostureFile()                        # throws on corruption
  next    = replaceTier(
              current,
              tier,
              { status, note, lastProbedAt: ts },
              lastWrittenAt: ts,
            )
  writePostureFile(next)                             # atomic: temp write + rename
  emitPostureChangeEvent({                           # append-only ledger
    id:        hash(tier, status, note, ts),         # idempotency key
    actor:     "brain-posture",
    action:    "brain.posture.tier.updated",
    scope:     `brain:${tier}:${status}`,
    timestamp: ts,
  })
  return next
```

Rationale for **write-then-ledger**: a committed state change whose ledger emission must be retried is recoverable. A ledger event that records a state change which never hit disk is a lie. The idempotency key lets retries detect duplicates.

## 5. Failure semantics

| Failure | Error | State on disk | Caller contract |
|---|---|---|---|
| Read parse / schema mismatch | `BrainPostureReadError` | unchanged | abort; do not write |
| Validation of mutation input | `BrainPostureWriteError` | unchanged | abort before any disk touch |
| Temp write fail | `BrainPostureWriteError` | unchanged (temp removed) | abort |
| Rename fail | `BrainPostureWriteError` | unchanged (rename is atomic) | abort |
| Ledger emit fail after successful write | `BrainPostureLedgerEmitError`, carries event payload | new posture on disk, no ledger event | retry ledger or manually append; do not re-write posture |

Caller contract: a successful `setTierPosture` means disk AND ledger are both committed. Any throw means the caller must treat the audit trail as potentially incomplete. The explicit `BrainPostureLedgerEmitError` with attached payload makes this recoverable without re-mutating posture.

## 6. Exact future files likely needed

Modified (2):
- `src/lib/spidernet/brain/storage.ts` — add `writePostureFile`, add `BrainPostureWriteError`.
- `src/lib/spidernet/brain/posture.ts` — add `setTierPosture`.

Added (1, possibly 2):
- `src/lib/spidernet/brain/events.ts` — new. Encapsulates `emitPostureChangeEvent`.
- `src/lib/spidernet/brain/errors.ts` — optional. Collects error classes; may instead stay co-located.

One-line export check:
- `src/lib/spidernet/ledger.ts` — verify `appendLedgerEvent(event)` is exported. Add it during Phase 2b if missing.

Explicitly not touched during the write-path phase:
- `src/lib/spidernet/data.ts`, `src/lib/spidernet/types.ts`, `src/lib/spidernet/brain-manager.ts`
- any UI component, any API route, mission file, Ollama config, specialist registry

## 7. Phased rollout

Each phase is independently verifiable (`lint`, `tsc --noEmit`, `build`) and independently revertable. Brain v1 read-only guarantees remain intact until Phase 2d.

- **Phase 2a — write primitive.** Add `writePostureFile` + `BrainPostureWriteError` in `storage.ts`. No caller. One commit.
- **Phase 2b — ledger emitter.** Add `brain/events.ts` + `emitPostureChangeEvent`. Verify `ledger.ts` API first; add export if missing. No caller. One commit.
- **Phase 2c — operation API.** Add `setTierPosture` in `posture.ts` wiring 2a + 2b. No caller. One commit.
- **Phase 2d — first real caller.** A probe loop, manual admin route, or probe API introduces the first invocation of `setTierPosture`. This is where route or UI work begins and is explicitly **out of scope for the Brain write-path phase.**

## Risks

- **Module boundary drift.** Brain's first authorized side effect outside itself. Mitigation: confine to `brain/events.ts`; inject the emitter at the test boundary so unit tests do not touch the live ledger file.
- **Concurrent writers.** Two simultaneous `setTierPosture` calls last-writer-wins on disk. Mitigation: v2 documents "single writer per tier at a time". File locking is deferred to v3 unless a concrete concurrent caller appears.
- **Ledger growth.** Each probe emits an event. Mitigation: rate limiting is the caller's responsibility, never the brain module's.
- **Schema forward-compat.** Locked Decision #3 still hard-fails. Correct for v2. Bumping to schema v2 later requires explicit migration code — plan now, implement then.
- **Read consistency during write.** `readPostureFile` → mutate → `writePostureFile` is not a transaction. Concurrent readers may see stale pre-mutation state between the two calls. Acceptable for posture (not a transactional resource). Flag only.

## Out of scope for this document

- Any probe loop, handshake, or external integration logic.
- UI or route wiring.
- Cleanup of the `brainStatus` compatibility bridge (deferred; may be reshaped by what the write path surfaces).
- Specialist registry, mission writing, Ollama handshake.
