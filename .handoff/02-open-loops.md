# Open Loops

1. Adopt handoff protocol as mandatory before future thread transfers.

## Preserved lanes — deferred, scope-approval pending
Each lane is a git stash. Do NOT mix lanes in a single packet. Resume one at a time, only after explicit scope approval.

- **wip/launcher-button** (Ubuntu Terminal Launcher track, NOT Bridge) — fixed floating SETU button in root layout. Do not mix with Bridge lanes.
  - Files: `src/app/layout.tsx`
  - Policy: resume under Launcher thread; outside Bridge scope

## Residual untracked files — origin unclear, scope-approval pending
These exist in the working tree but were not created by any committed packet in this thread. Do NOT fold them into unrelated packets. Decide intent explicitly before any action.

- **`src/app/api/health/route.ts`** — untracked `GET /api/health` handler returning `{ status, service: "setu-bridge", uptimeSeconds, node, ts }` with `Cache-Control: no-store` and `dynamic = "force-dynamic"`.
  - Discovered: 2026-04-18 during the smoke-ai-handoff refresh thread.
  - Origin: unknown — not produced by any Bridge commit in this thread (smoke packets A/B/C or handoff refreshes). Likely stray residue from a prior session.
  - Open choices:
    1. **Commit-in** as a standalone Bridge liveness endpoint — small, additive; would need lint/tsc/build sign-off and a stated caller.
    2. **Remove** if confirmed accidental.
    3. **Continue to defer** — leave untracked; re-evaluate in the next Bridge thread.
  - Policy until decided: do not touch; do not bundle with other packets; keep flagged in every handoff refresh.
  - **Decision (2026-04-18):** src/app/api/health/route.ts deferred to next Bridge thread for decision (commit/remove). Reason: endpoint origin and intent are unclear, no caller exists in the current tree, and it is not part of the SETU Bridge core milestone; avoid committing or deleting without full context.

## Resolved
- Compatibility cleanup vs future write-path/ledger design — both complete. Write path + admin route landed (Phases 2a..2d-2); compatibility bridge retired via 62fc21e.
- `/home/sattv/SpiderNet_Control/spidernet-dashboard` mirror-vs-drift question — closed per DRISHTI closed-items record (2026-04-16).
- **AI Handoff Provider (Bridge lane)** — landed across two packets. Packet A `21ee7be` (async refactor + `AIHandoffPayloadV1` rename, stub preserved). Packet B `aa65587` (`src/lib/spidernet/ai-providers.ts` added; fetch-based Anthropic call; failure taxonomy `config | auth | network | response_schema | rate_limit | permanent`; retry-on-next-dispatch via `sent.json` only on success). Original `wip/ai-handoff-provider` stash dropped after content fully absorbed.
- **Handoff refresh (cross-cutting paperwork lane)** — superseded twice: first rewrite at `67b4138`, then this refresh at current HEAD. Original `wip/handoff-refresh` stash dropped.
