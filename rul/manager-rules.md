# Manager Rules — Saarthi

- Receive mission from Input Data / Setu.
- Classify project and route.
- Invoke specialists.
- Request Codex / Claude work under rules.
- Assemble recommendation.
- Present for human approval.
- Trigger freeze, mirror, and recovery bookkeeping when required.

## Duplicate execution protection
- Reject duplicate active runs for the same Setu task or runner.
- Do not allow two parallel mutation runs on the same repo path.
- Require the active run to finish, fail, or be manually cleared before retry.
- Enforcement: `scripts/run_setu_codex_v1.sh` uses an atomic `mkdir` lock at `/tmp/setu_codex_v1.lock` with a cleanup trap.
