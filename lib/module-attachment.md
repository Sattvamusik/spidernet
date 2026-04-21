# Module Attachment

This document defines the capability / module attachment model for
Setu (Mother Bridge, brain, and spine) and its attached child lanes.
It is a companion to `docs/architecture/lane-topology.md` (identity +
topology) and `rul/lane-preservation.md` (enforceable rules).

## Attachment
A child lane declares its capabilities and attaches to Setu through
the wiring layer. Attachment is defined by:
- identity (human label + on-disk directory)
- capabilities (what the child offers to the wiring bus)
- contract references (event, packet, ledger, adapter, storage — see
  `lib/spidernet-contracts.md`)
- registry slice (entries the child writes into skillRegistry,
  wrapperRegistry, scoreRegistry, etc.)
- health and readiness signal surface

## Registry slicing
Registries are shared. Slices are lane-scoped. A sibling lane MUST
NOT read, write, or mutate another lane's slice. Cross-lane reads
that require coordination pass through Setu at the wiring layer.

## Capability growth
When a module attaches, Setu gains access to that module's
capabilities through the wiring bus. Setu may orchestrate, route, and
coordinate using those capabilities. Attachment does NOT transfer
ownership, editing rights, or file scope across lanes.

## Safe detachment
A module may be removed (detached) without collapsing parent
readiness. On detachment:
- Setu continues coordinating the remaining attached set
- the detached module's registry slice is marked retired; cleanup
  stays with the owning lane, not Setu
- fault-containment remains intact per `rul/lane-preservation.md`

## Advisory / orchestration capability
Setu may analyze, suggest, warn, and help correct drift across
lanes. This capability is advisory at the lane boundary: Setu does
not edit child files, absorb child working trees, or mutate sibling
slices as part of its advisory behavior. Corrections land only
through the owning lane.

## References
- `docs/architecture/lane-topology.md` — topology + identity
- `rul/lane-preservation.md` — enforceable ownership and
  fault-containment rules
- `lib/spidernet-contracts.md` — shared contracts consumed per-lane
