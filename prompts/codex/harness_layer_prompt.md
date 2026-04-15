Build only the SpiderNet harness layer.

Hard constraints:
- No UI changes.
- No unrelated file edits.
- No log updates.
- No docs updates.
- No redesign.
- Keep white SETU UI unchanged.
- Treat compatibility bridges as inventory, not final truth.
- Minimal typed implementation only.
- Safe local-only logic.
- Inventory any bridge/stub assumptions.

Target:
- src/lib/spidernet/harness.ts
- optional companion types only if strictly needed

Required exports:
- a harness input type
- a harness result type
- one function to create a harness record
- one function to finalize pass/fail verification
- one placeholder hook for ledger append integration

Requirements inside the harness:
- actor
- stage
- status
- timeout budget
- retry metadata
- verification result
- rollback flag
- timestamps

Do not touch unrelated files.
Return:
- exact files changed
- exact verification performed
- any inventory-grade assumptions
