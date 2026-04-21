# Lane Preservation

These rules protect parent and child-lane ownership under the
parent-spine-with-cognitive-core topology defined in
`docs/architecture/lane-topology.md`. Setu acts as brain (decision,
orchestration, recovery logic) and spine (coordination backbone);
neither role overrides child ownership.

## Ownership
- A wire between modules enables sync and orchestration, not transfer
  of ownership.
- A wire is not permission to edit the other side's files.
- File scope stays with the lane that owns the file.

## Fault containment
- A child-lane fault must not degrade sibling lanes.
- A child-lane fault must not degrade the parent (brain+spine)
  readiness.
- Readiness and recovery behavior remain scoped per lane and are
  coordinated by Setu; Setu does not absorb a lane's recovery state.

## Enforcement pointers
- Recovery behavior: `rul/recovery-rules.md`
- Mirror classes and critical-path preservation: `rul/mirror-rules.md`
- Safe-mode constraints when a lane is held: `rul/safe-mode-rules.md`
- Freeze eligibility via PASS gate: `rul/SETU-PASS-GATE.md`
- Launcher / Bridge file-level ownership table: `docs/architecture/setu-mine-vs-bridge.md`

## Non-negotiable
If a change would require editing another lane's files or absorbing
another lane's working tree to proceed, the change is out of scope.
The correct move is to stop, flag the other lane, and record the need
in `.handoff/02-open-loops.md` under the owning lane.
