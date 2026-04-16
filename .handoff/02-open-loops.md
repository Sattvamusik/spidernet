# Open Loops

1. Phase 2d design — choose first real caller of `setTierPosture`:
   - Option A: internal probe loop (server-side, triggered by cron/interval)
   - Option B: manual admin route (POST /api/spidernet/brain/posture)
   - Option C: probe API that caller invokes explicitly
   Deliverable: design doc update to `docs/architecture/spidernet-brain-write-path.md`
   or new `docs/architecture/spidernet-brain-phase-2d.md`. No code yet.

2. Compatibility bridge cleanup (`brainStatus` ↔ `brainPosture`) — still deferred.
   Revisit after Phase 2d design locks the caller shape, since the caller may
   reshape what the bridge surfaces.

3. Confirm whether /home/sattv/SpiderNet_Control/spidernet-dashboard is a mirror
   or drift copy. Still open.

4. Handoff protocol adopted; continue refreshing bundle after each code commit.
