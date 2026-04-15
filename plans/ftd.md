# FTD — Future To Do

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
