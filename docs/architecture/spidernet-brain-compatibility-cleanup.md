# Brain Compatibility Bridge — Cleanup Plan

Status: **Design only. No implementation.**
Scope: plan for retiring the `brainStatus` / `brainSignals` compatibility bridge that still ships in `DashboardSnapshot`, now that the read-only Brain v1 posture path and the Brain v2 write path have landed.

Governing locked decisions (from `.handoff/01-decisions.md`):
1. Option B — Brain v1 is read-only today. *(Brain v2 write path has since landed.)*
2. Corruption: throw, no silent recovery.
3. Schema mismatch: hard fail.
4. Timestamps live in `posture.ts`, not `storage.ts`.
5. Atomic write required for any future write path.
6. Compatibility bridge between `brainStatus` and `brainPosture` is **allowed temporarily**. This plan retires that allowance.

Governing scope lock (from `.handoff/manifest.json`):
- `brain_v1_mode: read_only`, `setTierPosture: false`, `touch_brain_manager: false`, `touch_intake: false`, `touch_mission: false`, `touch_ollama: false`, `touch_specialist_registry: false`.
- Cleanup stays inside the Brain/observatory surface and does not violate any of the above.

This document does not change the current repo. Every phase below is future work.

## 1. What the bridge is today

Two overlapping objects carry "brain" information on the dashboard snapshot:

- **`brainStatus: BrainStatus`** — declared at `src/lib/spidernet/types.ts:331-337`, required at `src/lib/spidernet/types.ts:385`, built by `buildBrainStatus(runtime)` at `src/lib/spidernet/data.ts:116-140`, emitted at `src/lib/spidernet/data.ts:511`. Carries `posture`, `memorySignal`, `localLaneSignal`, `ollamaSignal`, `note`.
- **`brainSignals: { memorySignal, localLaneSignal, ollamaSignal, note }`** — declared at `src/lib/spidernet/types.ts:386-391`, projected from `brainStatus` at `src/lib/spidernet/data.ts:230-235`, emitted at `src/lib/spidernet/data.ts:512`.

The file-backed Brain v1 path is:

- **`brainPosture?: BrainPostureSnapshot`** — declared at `src/lib/spidernet/types.ts:392`, computed via `loadPosture()` at `src/lib/spidernet/data.ts:236`, emitted at `src/lib/spidernet/data.ts:513`.

## 2. Consumer trace

Grep authoritative as of HEAD `f0f4483`.

| Symbol | Source | Consumers |
|---|---|---|
| `BrainStatus` type | `src/lib/spidernet/types.ts:331` | `src/lib/spidernet/types.ts:385` (DashboardSnapshot field); `src/lib/spidernet/data.ts:4` (type import), `data.ts:116` (builder return type) |
| `DashboardSnapshot.brainStatus` (required) | `src/lib/spidernet/types.ts:385` | `src/lib/spidernet/data.ts:511` (emit). **No UI reader.** |
| `DashboardSnapshot.brainSignals` | `src/lib/spidernet/types.ts:386-391` | `src/lib/spidernet/data.ts:230-235` (projection), `data.ts:512` (emit); `src/components/spidernet/observatory-board.tsx:86, 89, 92, 104` (UI) |
| `DashboardSnapshot.brainPosture` (optional) | `src/lib/spidernet/types.ts:392` | `src/lib/spidernet/data.ts:236, 513`; `src/components/spidernet/observatory-board.tsx:106-122` (UI) |
| `buildBrainStatus` | `src/lib/spidernet/data.ts:116-140` | sole caller at `data.ts:229` |

**Key observation.** `brainStatus` itself has **no UI reader**. The observatory-board only reads `brainSignals.*` and `brainPosture.*`. Only `brainSignals` and `brainPosture` are load-bearing UI surfaces; `brainStatus` is round-tripped through the snapshot with no consumer.

## 3. Disposition of the four bridge signals

`brainStatus.posture` is not projected into `brainSignals` and has no consumer — **dead on arrival, drop in C-2**.

The four signals that `brainSignals` *does* surface:

| Signal | Current source | Current UI | Recommended disposition | Reason |
|---|---|---|---|---|
| `memorySignal` | runtime counts (ledger events + vault entries) at `data.ts:129` | `observatory-board.tsx:86` "Context: …" | **Keep, relocate** | Not inventory-derived. Already available as `runtime.ledgerEvents.length` + `runtime.vaultEntries.length`. Belongs on a generic runtime-summary surface, not on a "brain" object. |
| `localLaneSignal` | `artifacts/runtime/spidernet/inventory/local_coding_lane_inventory.md` via `safeReadFile` at `data.ts:117` | `observatory-board.tsx:89` "Local lane: …" | **Keep, relocate** | Describes local coding lane, not brain posture. Candidate home: new `localLaneStatus` slice, or fold into `ollamaConfig`-adjacent shape. Out of scope for this plan to decide the final home; cleanup must preserve the string until a home is chosen. |
| `ollamaSignal` | composed from `runtime.ollamaConfig` fields at `data.ts:135` | `observatory-board.tsx:92` "Ollama: …" | **Drop projection, switch UI to `ollamaConfig` directly** | `DashboardSnapshot.ollamaConfig` (`types.ts:357-363`) already carries the same three fields structurally. `ollamaSignal` is a pre-joined string of them. Scope lock: **no Ollama handshake work** — this is display-string substitution only, not handshake work. |
| `note` | `artifacts/runtime/spidernet/inventory/spidernet_phase1_inventory.md` via `safeReadFile` at `data.ts:118` | `observatory-board.tsx:104` "Guardrail: …" | **Keep, relocate** | A guardrail string derived from phase-1 inventory. Logically belongs with continuity/readiness, not brain. Same "choose home later" caveat as `localLaneSignal`. |

"Keep, relocate" means: preserve the string on the snapshot under a new field in a later phase, not on a "brain" object. The UI row continues to render.

## 4. Phased rollout

Each phase compiles on its own, keeps `DashboardSnapshot` assignable, and is independently verifiable with:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Phases C-4 onward require naming decisions (where do the three still-needed strings live). C-1 through C-3 do not and can land without reopening those questions.

---

### Phase C-1 — Soften the contract

**Goal:** make `brainStatus` optional on `DashboardSnapshot` without removing the field or changing any runtime behavior. Prove by compilation that no UI reader depends on its presence.

**Change:**
- `src/lib/spidernet/types.ts:385` — `brainStatus: BrainStatus;` → `brainStatus?: BrainStatus;`

**Not changed:** `data.ts` still builds and emits `brainStatus`; observatory-board unaffected.

**Verification:** lint, tsc --noEmit, build. Build must still show the same 7 static routes.

**Reversibility:** revert one character.

---

### Phase C-2 — Stop emitting `brainStatus`

**Goal:** remove `brainStatus` from the snapshot entirely. Stop paying for a field with no consumers.

**Change:**
- `src/lib/spidernet/types.ts:385` — delete the `brainStatus?: BrainStatus;` line.
- `src/lib/spidernet/data.ts:511` — delete the `brainStatus,` line from the return literal.
- `src/lib/spidernet/data.ts:229` — `const brainStatus = buildBrainStatus(runtime);` is retained **for one more phase** because `brainSignals` at `data.ts:230-235` still reads its fields. (Renamed in C-3.)

**Not changed:** `BrainStatus` type still exists; `buildBrainStatus` still exists; `brainSignals` and UI unaffected.

**Verification:** lint, tsc --noEmit, build.

**Reversibility:** restore the two deleted lines.

---

### Phase C-3 — Collapse builder + type

**Goal:** make `brainSignals` a first-class thing with its own builder; delete the dead `BrainStatus` type and the dead `posture` field.

**Change:**
- `src/lib/spidernet/data.ts:116-140` — rename `buildBrainStatus` → `buildBrainSignals`; return type becomes the inline `brainSignals` object shape (4 fields, no `posture`); delete the `posture:` line at `data.ts:126-128`.
- `src/lib/spidernet/data.ts:4` — remove `BrainStatus` from the type-only import.
- `src/lib/spidernet/data.ts:229-235` — replace the two-step `const brainStatus = buildBrainStatus(...)` + projection with a single `const brainSignals = buildBrainSignals(runtime);`.
- `src/lib/spidernet/types.ts:331-337` — delete the `BrainStatus` type block.
- `src/lib/spidernet/types.ts:386-391` — extract the inline `brainSignals` object shape to a named type `BrainSignals` (or keep inline; reviewer's call). If extracted, `buildBrainSignals` returns `BrainSignals`.

**Not changed:** observatory-board still reads `snapshot.brainSignals.*`; inventory markdown reads still happen.

**Verification:** lint, tsc --noEmit, build.

**Reversibility:** restore `BrainStatus` type and rename the builder back. Single-PR revert.

---

### Phase C-4 — Relocate `ollamaSignal` onto `ollamaConfig`

**Goal:** eliminate the pre-joined Ollama display string from `brainSignals`; let the UI join on render.

**Change:**
- `src/components/spidernet/observatory-board.tsx:92` — replace `snapshot.brainSignals.ollamaSignal` with an inline template using `snapshot.ollamaConfig.{handshakeStatus, endpoint, note}` (shape already declared at `types.ts:357-363`).
- `src/lib/spidernet/data.ts` — remove `ollamaSignal` from the builder return and from the `brainSignals` type.
- `src/lib/spidernet/types.ts:386-391` (or the extracted `BrainSignals`) — remove the `ollamaSignal` field.

**Not changed:** no `ollamaConfig` changes, no handshake code. Scope lock preserved.

**Verification:** lint, tsc --noEmit, build. Visually confirm the Ollama row still renders the same information.

**Reversibility:** restore the field, its projection, and the prior UI expression.

---

### Phase C-5 — Relocate the three remaining strings; delete `brainSignals`

**Goal:** retire the name "brainSignals" entirely. Requires naming decisions for the three still-used strings.

This phase is **blocked on decisions** that are out of scope for this cleanup plan:
- Where does `memorySignal` live? Candidate: `runtimeSummary: { ledgerEventCount, vaultEntryCount }` computed on the snapshot, rendered by the board.
- Where does `localLaneSignal` live? Candidate: new `localLaneStatus` slice; or fold into an existing readiness surface.
- Where does `note` live? Candidate: `continuityStatus.guardrailNote` or a dedicated `guardrailNote`.

Until the destination surfaces are agreed, `brainSignals` stays. C-5 is listed so the plan is complete, not to pre-commit to the naming.

**Verification:** lint, tsc --noEmit, build.

**Reversibility:** restore `brainSignals` with its three strings.

---

## 5. Out of scope for this document

- Any change to the Brain v2 write path (`src/lib/spidernet/brain/*`), posture schema, or admin route at `src/app/api/spidernet/brain/posture/route.ts`.
- Any change to `brain-manager.ts`, intake, mission, Ollama handshake, or specialist registry (scope lock).
- Introducing new fields onto `brainPosture`. If the bridge signals migrate onto posture later, that's a posture-schema milestone, not this one.
- Cleanup of the inventory markdown files themselves (`artifacts/runtime/spidernet/inventory/*.md`). They remain readable by `buildBrainStatus`/`buildBrainSignals` until C-5 retires the readers.

## 6. Execution plan

### Recommended first execution packet — **Phase C-1**

One-character softening of the `DashboardSnapshot.brainStatus` contract. Highest-value-per-risk packet in the sequence: it is the smallest possible change that produces a real proof point (the type system confirms no UI reader of `brainStatus` exists), and it unlocks every later phase.

### Expected touched files for C-1

- `src/lib/spidernet/types.ts` (line 385, one character: `:` → `?:`)

No other file. No code logic changes. No commit until explicitly told.

### Rollback points after each phase

Each phase is revertable independently. Listed newest-first:

- **After C-1**: revert `?` in `types.ts:385`. One-character revert.
- **After C-2**: restore `brainStatus` field in `types.ts:385` and `brainStatus,` in `data.ts:511`. Two-line revert.
- **After C-3**: restore the `BrainStatus` type block in `types.ts:331-337`, restore the type-only import in `data.ts:4`, rename `buildBrainSignals` back to `buildBrainStatus` with its prior return type, restore the two-step projection in `data.ts:229-235`. Single-PR revert; no cross-phase dependencies.
- **After C-4**: restore `ollamaSignal` on `brainSignals` and the prior UI expression in `observatory-board.tsx:92`. Single-PR revert.
- **After C-5**: restore `brainSignals` with its remaining strings and the prior projections in `data.ts`. Single-PR revert; reverses only the phase itself, not C-1..C-4.

Checkpoint convention: each phase lands as its own commit with `npm run lint && npx tsc --noEmit && npm run build` verified green before commit, consistent with the write-path doc's "independently verifiable and independently revertable" clause.
