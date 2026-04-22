# FTD — Future To Do

## 2026-04-22 — P-DOCTRINE-PROPAGATION-02c parent follow-up packet
- Canonical home for this doctrine follow-up is `plans/ftd.md` because it is the live future-task packet for deferred parent-altitude work and keeps this step doc-only.
- Scope is Lane 1 only: Setu Mother Bridge follow-up doctrine, naming, and contract clarification. This packet does not change product code, `src/**`, child-module files, or `.handoff/*`.
- Guardrail: do not absorb OL-3 / OL-4 into this packet. If later execution needs child-lane changes, record them under the owning lane and land them separately.
- Peer-model reconciliation remains pending at the parent contract level: clarify how peer executors are compared, when they are advisory vs selectable, and how reconciliation results are surfaced without collapsing lane ownership.
- Novice input terminal follow-up remains pending: define the parent-side contract for novice guidance, summary/explanation support, and safe escalation from intake wording to module routing without redesigning the child UI here.
- Result surface contract remains pending: define the minimum truthful result states, error explanation fields, and completion surface expected after execution, especially when action, hold, or fallback paths diverge.
- Automatic module selection under `ALL` remains pending: define deterministic parent routing rules for multi-module requests, including when `ALL` fans out, when it resolves to one module, and how the selection rationale is shown.
- Self-heal visibility remains pending: define what recovery or corrective behavior can be shown at parent altitude without pretending that a child lane has already healed.
- Browser / desktop / operator flow upgrades remain pending: align the future routing story across browser surfaces, desktop launch paths, and operator-facing flows so the parent contract stays coherent before implementation.
- Claude / Codex file saving discipline remains pending: document the required save/freeze expectations for agent-assisted edits so generated work does not appear complete before files are actually written and preserved.
- Lane-label reconciliation remains pending: normalize how Setu Mother Bridge, Drishti Operations, Extraction Terminal, HUD, operator, and app labels are referenced so parent doctrine and future UI copy do not drift.
- Freeze rule for this packet: keep it as doctrine-only capture of pending parent work; no capability cuts, no lane crossing, and no implied implementation approval.

## 2026-04-16 — Ollama runtime truth path restored
- White SETU now has the documented `artifacts/runtime/spidernet/config/ollama.json` scaffold in place, with legacy fallback preserved for older repo states.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` passed for the contract fix.
- Remaining gap: the config file is still scaffold-only and does not prove a live Ollama handshake.
- Remaining gap: live route verification for the updated Memory and Brain posture still needs an environment that permits local port binding.

## 2026-04-16 — bridge continuity and Brain posture surfaced in white SETU
- Freeze, mirror, recovery, and Brain posture are now visible on the bridge deck as read-only status.
- Remaining gap: live HTTP route verification for the updated overview and observatory still needs an environment that permits local port binding.
- Remaining gap: Brain posture currently comes from runtime inventory plus artifact state, not from a live provider execution path.

## 2026-04-16 — white Setu verification-path hardening
- Local build no longer depends on remote Google Fonts fetches.
- `npm run build` now uses webpack because Turbopack hit a sandbox CSS worker permission failure here.
- Remaining gap: live HTTP startup and browser route checks still need verification in an environment that permits local port binding.
- Remaining gap: coding-flow durability is still split between shared checks and a route-level ledger follow-up; shared harness-ledger wiring is still pending.

## 2026-04-16 — Dash 001 local-only brain enforcement
- `local_only` coding-flow requests now hold when no live local brain lane is available instead of silently selecting a cloud tier.
- Remaining gap: wire a real local brain lane or revise the privacy policy for routes that can safely use cloud tiers.

## 2026-04-15 — Dash 001 coding-flow outcome persistence
- The intake POST path now writes a structured ledger event for the coding-flow preflight result.
- Keep the current packet creation path and `303` redirect stable while broader bridge cleanup remains inventory-only.

## High priority
- add live packet mutation flows if Dash 001 through Dash 005 need in-app editing rather than read-only runtime display
- add a dedicated smoke or test script to `package.json`
- add authenticated action handling for approvals and decision queue updates
- decide whether browser automation should become a live wrapper path
- decide whether desktop automation should remain manual hold in the web-first product

## Medium priority
- connect approval and execution packet mutation to real UI actions
- add screenshots of the updated white dashboard to `artifacts/`
- add route-level API handlers for runtime writes and refresh
- capture UI screenshots in `artifacts/screenshots`
- wire a real Ollama handshake after local endpoint confirmation

## Later
- add auth model and role-aware access control
- add CI validation and deployment runbook

## Blocked
- no dedicated automated test script is defined yet

## 2026-04-14 — Deferred North-Star Targets

[RESEARCH] Keep as future-state targets, not mandatory for every immediate phase:
- Kubernetes orchestration
- Service mesh
- RabbitMQ / Kafka
- CQRS / Saga / DDD / microservices split
- SOC2 / HIPAA / GDPR formal compliance tracks
- 10K+ req/sec throughput target
- 99.99% SLA target
- quarterly penetration testing program
- full blue-green / canary deployment automation
- complete IaC stack
- advanced chaos engineering
- mutation testing at scale
- sharding / replication / CDN / edge patterns
- active-active failover patterns

Reason:
These are strong long-term standards and should remain in SpiderNet direction, but forcing them as immediate universal hard requirements on every small build phase can create fake compliance theater, unnecessary complexity, and blocked progress.

Rule:
- Keep them visible
- Keep them tracked
- Pull them forward when project maturity justifies them

## SpiderNet future external-assist lanes
- [LATER] Goose integration for outsider agent support and local agent orchestration.
- [LATER] Giant local models only after workstation capacity and stability are upgraded.
- [LATER] Public exposure only after auth, hardening, rate limits, and zero-trust boundaries are real.
- [LATER] Advanced auth layer for admin and mutation routes.
- [LATER] Autonomous multi-agent swarms only after harness, ledger, permissions, and rollback are mature.

## 2026-04-15 — Dash 001 intake wiring pass
- `src/app/api/spidernet/intake/route.ts` now calls `runCodingFlow(...)` before writing the intake packet, but it remains a non-blocking inventory check so intake redirect behavior stays intact.
- `scripts/spidernet-coding-launcher.sh` now resolves the repo root dynamically and prefers `.venv-tools/bin/aider` when available.
- Remaining gap: `npm run build` is still blocked by remote Google Fonts fetches in this environment, so full production build verification did not complete in this run.
- Remaining gap: other helper scripts with hardcoded repo roots were left untouched to keep the patch minimal.
