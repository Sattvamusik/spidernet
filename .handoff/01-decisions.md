# Locked Decisions

1. Option B approved: read-only Brain v1 only
2. Corruption behavior: throw, do not silently recover
3. Schema mismatch: hard fail
4. Timestamps stay out of storage.ts
5. Atomic write required for future write path
6. Code repo is /home/sattv/projects/spidernet-control-deck
7. DRISHTI is context workspace, not the app repo
8. SETU Bridge track (dashboard) kept separate from DRISHTI `setu-launcher-node` and Ubuntu Terminal Launcher work
9. Ownership split per `docs/architecture/setu-mine-vs-bridge.md`: Launcher = access; Bridge = logic
10. One milestone at a time; resume at most one preserved lane per packet; stop before commit unless explicitly asked

## Resolved
- Temporary compatibility bridge between brainStatus and brainPosture — retired as commit 62fc21e (C-1..C-5). No longer a locked rule.
