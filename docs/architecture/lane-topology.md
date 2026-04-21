# Lane Topology

## Canonical topology
Setu is both the cognitive core and the coordination spine of this
system. Setu Mother Bridge is the parent; all other modules and
layers — Launcher, Shani, Bridge app `src/**`, HUD, and any future
sibling — attach as child lanes through the wiring layer.

## Brain and spine
Setu plays two roles at the parent altitude:
- **Brain** — decision, orchestration, recovery logic.
- **Spine** — coordination backbone across modules.

These are two views of the same parent, not separate services: brain
when it decides, spine when it coordinates.

## Parent altitude
The parent owns:
- parent/child architecture
- module wiring contract
- shared design system
- naming rules
- dashboard blueprint
- what belongs in parent vs child modules

Parent-altitude decisions are recorded in `.handoff/01-decisions.md`.
Shared cross-lane contracts live in `lib/spidernet-contracts.md`.

## Child lanes
Each child lane owns its own implementation. A child lane may carry a
distinct mix of skills, agents, and AI tools (Claude, Codex, Ollama,
local models, wrappers). The registries in `lib/spidernet-contracts.md`
(skillRegistry, wrapperRegistry, scoreRegistry) are the shared contract;
each child populates its own slice without collision with siblings.

Current child lanes (non-exhaustive):
- Launcher — process supervision / access
- Shani — verification, freeze, restore
- Bridge app `src/**` — product logic (ingest → filtration → FTD → AI handoff)
- HUD — operator awareness surface

Additional siblings (e.g. Drishti Operations, 001 Extraction Terminal,
future modules) attach the same way. A child's on-disk directory may
use kebab-case and need not match any human label literally; the
mapping belongs to the child's own handoff or registry entry.

## Wiring layer
The wiring layer is the bus between the parent (brain+spine) and each
attached child lane. Its responsibilities:
- in-sync operation across lanes
- orchestration — parent decisions reach the correct child lane
- contract-level message exchange (event, packet, ledger, adapter)
- readiness and health signals propagating upward
- parent-issued routing decisions propagating downward

Recovery and readiness remain scoped per lane; Setu coordinates across
lanes but does not absorb a lane's recovery state.

The flat directed graph in `docs/architecture/spidernet-wiring-map.md`
enumerates the specific wires. This document frames the bus; that map
enumerates it.

## Non-collapse rule
Connection through the wiring layer enables sync and orchestration but
does NOT transfer ownership, editing rights, or file scope across
lanes. The enforceable form lives in `rul/lane-preservation.md`.

## References
- `docs/architecture/setu-mine-vs-bridge.md` — Launcher vs Bridge access/logic split
- `docs/architecture/spidernet-wiring-map.md` — concrete wiring graph
- `docs/architecture/spidernet-ownership-map.md` — role owners
- `rul/lane-preservation.md` — enforceable lane rule
- `lib/spidernet-contracts.md` — shared contracts (event, packet, ledger, adapter, storage, registries)
