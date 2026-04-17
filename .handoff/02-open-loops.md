# Open Loops

1. Adopt handoff protocol as mandatory before future thread transfers.

## Preserved lanes — deferred, scope-approval pending
Each lane is a git stash. Do NOT mix lanes in a single packet. Resume one at a time, only after explicit scope approval.

- **wip/launcher-button** (Ubuntu Terminal Launcher track, NOT Bridge) — fixed floating SETU button in root layout. Do not mix with Bridge lanes.
  - Files: `src/app/layout.tsx`
  - Policy: resume under Launcher thread; outside Bridge scope

## Resolved
- Compatibility cleanup vs future write-path/ledger design — both complete. Write path + admin route landed (Phases 2a..2d-2); compatibility bridge retired via 62fc21e.
- `/home/sattv/SpiderNet_Control/spidernet-dashboard` mirror-vs-drift question — closed per DRISHTI closed-items record (2026-04-16).
- **AI Handoff Provider (Bridge lane)** — landed across two packets. Packet A `21ee7be` (async refactor + `AIHandoffPayloadV1` rename, stub preserved). Packet B `aa65587` (`src/lib/spidernet/ai-providers.ts` added; fetch-based Anthropic call; failure taxonomy `config | auth | network | response_schema | rate_limit | permanent`; retry-on-next-dispatch via `sent.json` only on success). Original `wip/ai-handoff-provider` stash dropped after content fully absorbed.
- **Handoff refresh (cross-cutting paperwork lane)** — superseded twice: first rewrite at `67b4138`, then this refresh at current HEAD. Original `wip/handoff-refresh` stash dropped.
