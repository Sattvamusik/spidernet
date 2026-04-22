# SETU Memory Protocol

## Purpose

Setu Mother Bridge is the live local brain and spine of the system.

This protocol defines:
- where durable memory lives
- what counts as source of truth
- how Claude, Codex, and future tools must resume
- how decisions are saved so the user is not forced to repeat them

GitHub is the mirrored history and shared memory layer.
The local PC filesystem is the primary live brain store.

---

## Core identity

- Setu = Mother Bridge, brain, and spine
- Drishti = child operator module
- Child modules may attach through Setu's wiring/orchestration layer
- Connection does not transfer ownership, editing rights, or file scope
- The system is orchestration-first, not dashboard-first
- The UI is a surface, not the core system

---

## Memory model

### Primary live memory
Lives on the local machine inside the Setu repo and approved runtime/state locations.

### Mirrored durable memory
Lives in Git/GitHub through:
- commits
- branches
- pull requests
- tracked docs
- tracked handoff files

### Rule
If something matters, it must be written into the local Setu brain in files.
If it must persist across sessions/tools, it must also be committed to Git.

---

## Source of truth order

Unless a lane explicitly overrides this, all agents must read in this order:

1. repo filesystem
2. `.handoff/manifest.json`
3. `.handoff/00-current-state.md`
4. `.handoff/01-decisions.md`
5. `.handoff/02-open-loops.md`
6. `.handoff/03-recovery.md`
7. `.handoff/04-approved-steps.md`
8. `.handoff/05-repo-facts.txt`
9. `docs/architecture/`
10. `dna/`
11. `blp/`
12. `lib/`
13. `rul/`
14. `ftd/`
15. `AGENTS.md`
16. git history
17. GitHub branch/PR state
18. chat only if consistent with the above

---

## Agent rule

Before asking the user to restate prior decisions, every agent must first read the source-of-truth stack.

If the answer already exists in the repo, handoff, doctrine, or git history:
- do not ask the user to repeat it
- use the stored answer
- cite or point to the file when useful

If the answer does not exist:
- ask only the smallest necessary grouped question
- after the answer is given, save it into the appropriate memory layer

---

## Memory layers and what goes where

### `.handoff/`
Current lane state and resume continuity.
Use for:
- verified current state
- locked decisions in effect for the lane
- open loops
- approved steps
- recovery notes
- next-thread resume prompts

### `docs/architecture/`
System shape and architecture framing.
Use for:
- parent/child topology
- module relationships
- wiring model
- UI-vs-core distinctions
- structural maps

### `dna/`
Core identity and truth.
Use for:
- what Setu is
- what the system is fundamentally for
- non-negotiable product identity

### `blp/`
Build laws and constraints.
Use for:
- design laws
- sequencing laws
- anti-collapse rules
- novice-first product laws

### `lib/`
Reusable definitions and contracts.
Use for:
- module roles
- lane ownership definitions
- subsystem meanings
- output/result contracts
- attachment/detachment contracts

### `rul/`
Operational rules.
Use for:
- safe behaviors
- non-absorption rules
- recovery boundaries
- cross-lane restrictions
- agent conduct rules

### `ftd/`
Future work and deferred follow-ups.
Use for:
- planned reconciliations
- not-yet-landed work
- deferred doctrine propagation
- future UI/product tasks

### Git history
Use for:
- exact change chronology
- commit-level traceability
- lane evolution
- recovery and rollback

---

## Lane protocol

- One repo may contain multiple lanes
- Lanes should normally use separate branches
- Parent and child lanes may be connected architecturally without sharing edit ownership
- No lane may silently absorb another lane's dirty work
- Deferred work must be explicitly recorded, not silently mixed in
- A child fault must not degrade parent readiness
- Recovery remains scoped per lane, coordinated by Setu

---

## Save-once rule

When the user states something important, it should be saved once into the correct memory layer.

Examples:
- identity truth -> `dna/`
- build law -> `blp/`
- reusable contract -> `lib/`
- operating rule -> `rul/`
- deferred future step -> `ftd/`
- current lane status -> `.handoff/`

Goal:
The user should not need to repeat durable decisions across sessions.

---

## Resume protocol

Every new Claude/Codex/agent session should begin with:

1. identify the repo and current branch
2. read the source-of-truth stack in order
3. summarize:
   - verified state
   - locked decisions
   - open loops
   - safest next step
4. ask grouped blocking questions only if necessary
5. stop before commit unless explicitly told otherwise

---

## Commit discipline

- Commit only scoped files for the active packet
- Do not absorb unrelated dirty files
- Keep packet boundaries explicit
- Prefer small reversible commits
- Push lane branches to GitHub so the memory spine is shared across tools

---

## GitHub role

GitHub is the mirrored shared memory/history layer for Setu.

It is used for:
- branch-based lanes
- remote backup
- PR review
- cross-tool continuity
- durable access to prior decisions and code changes

GitHub is not the only brain.
The live brain remains the local Setu system on the PC.

---

## What agents must not do

- do not restart discovery if a valid handoff already exists
- do not reopen settled decisions unless explicitly reopened
- do not ask the user to repeat information already stored in source-of-truth files
- do not treat chat memory as higher-trust than repo truth
- do not transfer ownership across lanes just because modules are connected
- do not collapse architecture into a dashboard-first interpretation

---

## Operating summary

Setu Mother Bridge is the live brain and spine.
The PC filesystem is the primary brain memory.
Git/GitHub is the mirrored durable memory/history layer.
Claude, Codex, and future tools must read Setu's tracked memory first.
The user should not have to repeat durable truths once they are saved correctly.
