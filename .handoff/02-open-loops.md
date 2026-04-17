# Open Loops

1. Adopt handoff protocol as mandatory before future thread transfers.

## Preserved lanes — deferred, scope-approval pending
Each lane is a git stash. Do NOT mix lanes in a single packet. Resume one at a time, only after explicit scope approval.

- **wip/ai-handoff-provider** (Bridge track) — replace stubbed handoff with a real AI provider call. Do not mix with Launcher or handoff-refresh.
  - Files: `src/lib/spidernet/{ai-handoff,ftd,filtration}.ts`, `src/app/api/{packet,spidernet/intake}/route.ts`, `package.json`, `package-lock.json`
  - Blocked: missing `src/lib/spidernet/ai-providers.ts`; `@anthropic-ai/sdk ^0.90.0` dep awaiting approval

- **wip/launcher-button** (Ubuntu Terminal Launcher track, NOT Bridge) — fixed floating SETU button in root layout. Do not mix with Bridge lanes.
  - Files: `src/app/layout.tsx`
  - Policy: resume under Launcher thread; outside current Bridge scope

- **wip/handoff-refresh** (cross-cutting paperwork) — stale precursor superseded by this rewrite. Do not re-apply.
  - Files: 5 files under `.handoff/`
  - Status: discardable after acceptance of this packet

## Resolved
- Compatibility cleanup vs future write-path/ledger design — both complete. Write path + admin route landed (Phases 2a..2d-2); compatibility bridge retired via 62fc21e.
- `/home/sattv/SpiderNet_Control/spidernet-dashboard` mirror-vs-drift question — closed per DRISHTI closed-items record (2026-04-16).
