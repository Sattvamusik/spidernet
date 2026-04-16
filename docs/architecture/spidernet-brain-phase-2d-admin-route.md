# Brain Phase 2d — Admin Posture Route (Design Only)

Status: **Design only. No implementation.**
Parent doc: `docs/architecture/spidernet-brain-write-path.md` (§7 Phase 2d).
Scope: the first real caller of `setTierPosture`. A single HTTP route that writes a tier's posture and emits the corresponding ledger event. No UI. No probe loop. No scheduler. No auth beyond "local/trusted only, documented."

Governing locked decisions still in force (`.handoff/01-decisions.md`):
1. Option B — brain module's only public mutation entry point is `setTierPosture`.
2. Corruption: throw, no silent recovery.
3. Schema mismatch: hard fail.
4. Timestamps live in `posture.ts`, not `storage.ts`.
5. Atomic write required (already enforced by `writePostureFile`).
6. `brainStatus` / `brainPosture` compatibility bridge remains temporarily.

Phase 2d-specific answers (recorded at design time):
- Route path: `POST /api/spidernet/brain/posture`.
- Auth posture v1: no auth; local/trusted only; documented in response and doc.
- Ledger-emit-after-successful-write failure: **207-style partial success**. The posture write is NOT rolled back. Response body carries the event payload to support out-of-band retry.

## 1. Route

- **Method:** `POST`
- **Path:** `/api/spidernet/brain/posture`
- **File (future):** `src/app/api/spidernet/brain/posture/route.ts`
- **Content-Type in:** `application/json`
- **Content-Type out:** `application/json`
- **Not touched:** brain-manager, intake, mission, Ollama, specialist registry, observatory UI, compatibility bridge.

### 1.1 Request schema

```jsonc
{
  "tier":   "cloud_primary" | "cloud_mini" | "local_ollama",
  "status": "prepared" | "probing" | "live" | "unavailable" | "unknown",
  "note":   "string, 1..512 chars, trimmed"
}
```

Exact set mirrors `VALID_TIERS` / `VALID_STATUSES` in `brain/storage.ts`. Route does not hardcode them; it delegates to `setTierPosture`, which already rejects unknown tiers, and adds its own shallow validator for shape before calling into brain (fail fast with 400 instead of 500 on obvious shape errors).

### 1.2 Success response (full success — both write and ledger OK)

HTTP `200 OK`

```jsonc
{
  "ok": true,
  "partial": false,
  "snapshot": {
    "schemaVersion": 1,
    "lastWrittenAt": "<iso>",
    "tiers": [ /* full BrainPostureSnapshot */ ]
  },
  "event": {
    "id":        "<sha256 idempotency key>",
    "actor":     "brain-posture",
    "action":    "brain.posture.tier.updated",
    "scope":     "brain:<tier>:<status>",
    "timestamp": "<iso matches snapshot.lastWrittenAt>"
  }
}
```

### 1.3 Partial success response (write OK, ledger failed)

HTTP `207 Multi-Status` (chosen as the signal; body is authoritative)

```jsonc
{
  "ok": false,
  "partial": true,
  "committed": {
    "posture": true,
    "ledger":  false
  },
  "snapshot": { /* new posture snapshot — already on disk */ },
  "event":    { /* full ledger event payload, not yet persisted */ },
  "error": {
    "name":    "BrainPostureLedgerEmitError",
    "message": "Failed to append brain posture change event to ledger."
  },
  "retry": {
    "strategy": "Caller may re-POST the ledger event out-of-band using the 'event' payload once ledger I/O is healthy. Do NOT re-POST this endpoint with the same body — that would produce a second posture write with a new timestamp and a different idempotency key."
  }
}
```

Rationale: 207 is not perfectly fit (it is defined for WebDAV multi-resource responses) but it is the least-wrong standard code for "more than one side effect; some succeeded, some did not." The body — not the status — is the contract. Clients MUST inspect `ok` / `partial` / `committed`.

### 1.4 Error responses

| Case | HTTP | Body shape |
|---|---|---|
| Request is not JSON / parse fail | `400` | `{ ok: false, error: { code: "BAD_JSON", message } }` |
| Missing field / wrong type | `400` | `{ ok: false, error: { code: "BAD_REQUEST", message, field? } }` |
| `tier` not in allowed set | `400` | `{ ok: false, error: { code: "UNKNOWN_TIER", message, tier } }` |
| `status` not in allowed set | `400` | `{ ok: false, error: { code: "UNKNOWN_STATUS", message, status } }` |
| `note` empty or > 512 chars | `400` | `{ ok: false, error: { code: "BAD_NOTE", message } }` |
| Posture read corruption / schema mismatch | `500` | `{ ok: false, error: { code: "BRAIN_POSTURE_READ", message } }` |
| Validation-of-mutation failure inside brain | `400` | `{ ok: false, error: { code: "BRAIN_POSTURE_WRITE_VALIDATION", message } }` |
| Disk I/O failure on write (temp / rename) | `500` | `{ ok: false, error: { code: "BRAIN_POSTURE_WRITE_IO", message } }` |
| Ledger emit failure after successful write | `207` | Partial-success body above |
| Any other unexpected throw | `500` | `{ ok: false, error: { code: "UNEXPECTED", message } }` |

## 2. Validation contract

The route performs shallow shape validation BEFORE invoking `setTierPosture` so predictable client mistakes yield 400, not 500.

Route-level validation (fail-fast, 400):
- Body is valid JSON object.
- `tier`, `status`, `note` are present and are strings.
- `note.trim().length` is in `[1, 512]`.
- `tier` ∈ `VALID_TIERS`, `status` ∈ `VALID_STATUSES` (duplicated here for clean 400s — brain module remains the authority).

Brain-level validation (inside `setTierPosture`, authoritative):
- Existing `validateSnapshot` / `validateTierPosture` run on the next snapshot via `writePostureFile`.
- Unknown tier → `BrainPostureWriteError` → mapped to `400 BRAIN_POSTURE_WRITE_VALIDATION`.
- Any schema-level error → bubble up per Locked Decision #3.

The route does not trim/coerce silently beyond `note = note.trim()`. Unknown top-level fields are allowed and ignored (non-breaking for future fields).

## 3. Auth posture (v1)

**Explicit:** no authentication, no authorization, no rate limiting.

Intended deployment: localhost or trusted internal network. Do not expose this route to the public internet without adding auth in a subsequent phase.

Route MUST include an `x-brain-route-auth: none-v1-trusted-only` response header so that accidental public exposure is easy to detect in logs. The doc for this route MUST state this explicitly. No silent upgrade path — any future auth is a new phase (2e or later) with its own doc.

## 4. Error mapping (full picture)

```
POST /api/spidernet/brain/posture
│
├── parse body
│     └── fail → 400 BAD_JSON
├── shape check
│     └── fail → 400 BAD_REQUEST | UNKNOWN_TIER | UNKNOWN_STATUS | BAD_NOTE
├── setTierPosture(tier, { status, note })
│     ├── throws BrainPostureReadError          → 500 BRAIN_POSTURE_READ
│     ├── throws BrainPostureWriteError (validation) → 400 BRAIN_POSTURE_WRITE_VALIDATION
│     ├── throws BrainPostureWriteError (I/O)        → 500 BRAIN_POSTURE_WRITE_IO
│     ├── throws BrainPostureLedgerEmitError        → 207 partial-success body
│     └── returns snapshot                           → 200 success body
└── any other throw                                  → 500 UNEXPECTED
```

Distinguishing the two `BrainPostureWriteError` sub-cases: the route inspects the error's `cause`. If `cause` is present and is an I/O error, map to 500; otherwise (validation throws without a `cause`), map to 400. A future refactor may replace this heuristic with distinct error subclasses — noted, not required for Phase 2d.

`BrainPostureLedgerEmitError` carries the unsent `event` on the thrown error object; the route reads it to build the partial-success body. Posture write is NOT re-attempted or reverted.

## 5. Idempotency

- The idempotency key is computed inside `setTierPosture` as `sha256(tier, status, note, timestamp)`.
- The timestamp is generated per call; therefore two identical request bodies separated in time produce two distinct events and two distinct snapshot writes.
- Within the same millisecond, identical bodies produce identical keys — sufficient to dedupe accidental double-clicks at the ledger layer if/when the ledger applies key-based dedupe.
- Caller-side dedupe (e.g. client-provided request id) is explicitly **out of scope for Phase 2d**. Adding it would require reshaping `setTierPosture`, which is settled.
- Partial-success retry (ledger-only retry using the carried event payload) is described in §1.3. It is intentionally out-of-band: no route reuse, no re-write.

## 6. Test plan

Unit tests (new file, e.g. `src/app/api/spidernet/brain/posture/route.test.ts` or equivalent under the repo's existing test convention):

1. **Happy path** — valid body → 200, response shape matches §1.2, `setTierPosture` called once with trimmed note.
2. **Bad JSON** — body is `"not-json"` → 400 `BAD_JSON`.
3. **Missing field** (`tier` absent) → 400 `BAD_REQUEST`.
4. **Wrong type** (`status` is a number) → 400 `BAD_REQUEST`.
5. **Unknown tier** (`tier: "mars"`) → 400 `UNKNOWN_TIER`.
6. **Unknown status** (`status: "angry"`) → 400 `UNKNOWN_STATUS`.
7. **Empty note** → 400 `BAD_NOTE`.
8. **Note too long** (513 chars) → 400 `BAD_NOTE`.
9. **Note with surrounding whitespace** → 200; persisted note is trimmed.
10. **Read error** — stub `setTierPosture` to throw `BrainPostureReadError` → 500 `BRAIN_POSTURE_READ`.
11. **Write validation error** — stub to throw `BrainPostureWriteError` without `cause` → 400 `BRAIN_POSTURE_WRITE_VALIDATION`.
12. **Write I/O error** — stub to throw `BrainPostureWriteError` with I/O `cause` → 500 `BRAIN_POSTURE_WRITE_IO`.
13. **Partial success (ledger fail)** — stub to throw `BrainPostureLedgerEmitError` carrying an event → 207, body matches §1.3, `committed.posture: true`, `committed.ledger: false`, `event` matches carried payload.
14. **Unexpected error** — stub to throw plain `Error` → 500 `UNEXPECTED`.
15. **Header present** — response includes `x-brain-route-auth: none-v1-trusted-only`.
16. **Ignores unknown extra fields** — body with extra field `{ foo: "bar" }` does not fail validation.

Integration test (one):

17. **End-to-end** against a scratch `artifacts/runtime/spidernet/brain/posture.json` in a tmp cwd: POST a valid body, then read the file; assert tier updated, `lastWrittenAt` set, ledger file appended. Skip on CI if ledger I/O is not sandboxable; prefer running under the same harness intake tests use.

Not in test plan (deferred):
- Concurrency (two simultaneous POSTs). Flagged in parent doc §Risks; not introduced here.
- Auth — there is none to test.

## 7. Phased rollout / implementation plan

Each step is independently verifiable (`lint`, `tsc --noEmit`, `build`) and independently revertable. Brain v2 write-path guarantees remain intact throughout.

- **Phase 2d-1 — route scaffold.** Create `src/app/api/spidernet/brain/posture/route.ts` exporting `POST`. Happy-path body only; delegates to `setTierPosture`. No validation branch coverage yet. Returns §1.2 response on success. On any throw, returns 500 `UNEXPECTED` temporarily. One commit.
- **Phase 2d-2 — validation + error mapping.** Fill in §2 validation and §4 error mapping, including 207 partial-success branch reading the event payload off `BrainPostureLedgerEmitError`. One commit.
- **Phase 2d-3 — route unit tests.** Add tests 1–16 from §6. One commit.
- **Phase 2d-4 — integration test + doc cross-link.** Add test 17 if the harness permits. Update `docs/architecture/spidernet-brain-write-path.md` §7 to mark Phase 2d status as "shipped." Update `.handoff/00-current-state.md` and manifest `scope_lock`. One commit + handoff refresh commit.

Out of scope for Phase 2d (explicit):
- UI surface for triggering the route.
- Probe loop or scheduler (Option A from the Phase 2d decision).
- Auth (phase 2e or later, separate doc).
- Compatibility bridge cleanup (still deferred).
- Any change to brain-manager, intake, mission, Ollama handshake, or specialist registry.

## Risks

- **Accidental public exposure.** No auth. Mitigation: explicit response header, explicit doc section, deployment-level gating (firewall / reverse proxy). If the route is ever reachable from outside trusted networks, this becomes a live bug.
- **207 semantics.** Non-standard for non-WebDAV. Mitigation: body is authoritative; `ok` / `partial` / `committed` are the actual contract. Clients ignoring status code and reading the body will be correct.
- **Error sub-case heuristic (`cause`-based discrimination of `BrainPostureWriteError`).** Fragile if brain module starts setting `cause` on validation errors. Mitigation: if this becomes unstable, introduce `BrainPostureWriteValidationError` vs `BrainPostureWriteIOError` in the brain module — out of scope here, but low-cost later.
- **Concurrent writers via route.** Two simultaneous POSTs to the same tier: last-writer-wins on disk, both ledger events appended. Consistent with parent doc §Risks.
- **Stale snapshot reads between steps.** Inherited from parent doc §Risks — still acceptable; posture is not a transactional resource.

## Out of scope for this document

- Any implementation.
- Any UI.
- Any auth mechanism.
- Any probe loop / scheduler.
- Any change to Phase 2a–2c internals.
