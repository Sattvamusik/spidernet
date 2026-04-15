# SETU Temporary Inventory — 2026-04-15

## Bridge / provisional items
- `src/lib/spidernet/data.ts` currently returns compatibility bridge fields to satisfy older board expectations.
- `getBoardQuickStats(snapshot, _boardId?)` accepts an unused second argument for route compatibility.
- Intake packet records are temporarily bridged into `packets` with added compatibility fields like `kind: "intake"` and `manager: "saarthi"` for older type expectations.
- `scoreMemory`, `managerSynthesis`, `readinessGates`, `researchTools`, `liveTools`, `preparedTools`, `activePolicies`, `authorityChecks`, `specialists`, `compatibilityRules`, `observatorySignals`, and `boardModel` are currently compatibility placeholders.
- `src/lib/spidernet/data.ts` currently uses an `unknown as DashboardSnapshot` bridge cast to satisfy older route and board expectations until domain models are tightened.
- Snapshot compatibility is temporary and must be replaced board-by-board with stricter typed domain models.
- Compatibility exports in `src/lib/spidernet/storage.ts` exist to support older route callers and should be retired after route cleanup.

## Current rule
These items are inventory, not final architecture truth.
