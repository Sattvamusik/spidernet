# 🕸 SPIDERNET/VATAYAN — RULES

## DOCTRINE AUTHORITY
- Parent/child identity and topology come from `docs/architecture/lane-topology.md`
- Enforceable lane ownership and fault-containment rules come from `rul/lane-preservation.md`
- If another rule file restates parent/child ownership differently, the two files above win

## HARD EXECUTION RULES
- Always create folders and files first when foundation is missing
- Never change storage shape without checking all readers
- Never rely on chat memory alone for critical rules
- Prefer one-shot overwrite scripts over manual editing for novice execution
- Always restart and verify in the same script when practical
- Freeze last known good state before risky changes
- No silent failures
- No fake integrations claimed as live
- No direct writes to runtime JSON after bootstrap except through code paths

## STORAGE RULES
- Runtime writes must be atomic
- Use temp file + rename pattern
- Default empty shapes must match readers exactly
- Arrays must stay arrays, objects must stay objects
- Schema changes require same-phase reader update

## MANAGER RULES
Saarthi must:
- read packets
- classify work
- choose route
- record decision
- emit next action
- update ledger

## CHITRAGUPTA RULES
Chitragupta must:
- record every state-changing event
- block forward movement when gates fail
- expose readiness state clearly

## NOVICE EXECUTION RULES
- Prefer terminal-safe scripts over browser-console steps
- Avoid asking for manual multi-file edits when full overwrite is possible
- Keep one block = one outcome
