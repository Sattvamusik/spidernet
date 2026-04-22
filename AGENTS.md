# SETU Agent Rule

Always follow:
docs/architecture/SETU-MEMORY-PROTOCOL.md

## Source of truth order
1. repo filesystem
2. .handoff/*
3. docs/architecture/*
4. dna/*
5. blp/*
6. lib/*
7. rul/*
8. ftd/*
9. git history
10. chat only if needed

## Rules
- Do not restart discovery if a valid handoff already exists
- Do not ask the user to repeat saved decisions
- Do not reopen settled decisions unless explicitly reopened
- Do not override lane boundaries
- Do not absorb unrelated dirty work from other lanes
- Stop before commit unless explicitly told

## Resume behavior
At the start of every task:
1. identify current repo and branch
2. read the source-of-truth stack in order
3. summarize:
   - current verified state
   - locked decisions
   - open loops
   - safest next step
4. ask grouped blocking questions only if necessary

## Lane discipline
- Setu Mother Bridge is the parent brain and spine
- Child modules may connect through Setu without transferring ownership
- Recovery remains scoped per lane, coordinated by Setu
- A child fault must not degrade parent readiness

## Memory rule
If something important is learned or decided, save it into the correct layer:
- identity truth -> dna/
- build law -> blp/
- contract/definition -> lib/
- operating rule -> rul/
- future follow-up -> ftd/
- current lane state -> .handoff/

If it matters across sessions, commit it to Git.
