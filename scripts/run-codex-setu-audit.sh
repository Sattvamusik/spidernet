#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$HOME/projects/spidernet-control-deck"
cd "$ROOT"

mkdir -p .codex/prompts .codex/logs

cat > .codex/prompts/setu_audit_and_apply_prompt.txt <<'PROMPT'
You are working in the SpiderNet / SETU repo.

Identity and operating rules:
- Address the operator as Vatayan ji in your final report.
- This is SpiderNet / SETU context.
- Repo root: ~/projects/spidernet-control-deck

Non-negotiables:
- Do not redesign UI.
- Keep the white SETU UI unchanged.
- Do not touch unrelated files.
- Do not claim something is verified unless build and checks actually pass.
- Treat bridge / compatibility / placeholder logic as inventory, not final architecture truth.
- Prefer minimal, typed, safe changes.
- Keep everything local-first where possible.

What SETU is:
SETU is SpiderNet's bridge deck. It is supposed to be the place where:
- event comes in
- validation runs
- authority runs
- provider/brain selection happens
- execution happens
- ledger records outcome
- operator can see the whole path

What is already known and should be preserved:
- Dash 001 / Input Data works end-to-end for local packet creation and ledger append.
- White UI must remain intact.
- Intake POST must remain alive.
- Packet + ledger writes must stay in sync.
- Local coding lane is usable.
- Aider may exist at .venv-tools/bin/aider even if not globally on PATH.

Important files to inspect first:
- src/app/api/spidernet/intake/route.ts
- src/lib/spidernet/coding-flow.ts
- src/lib/spidernet/harness.ts
- src/lib/spidernet/socrates.ts
- src/lib/spidernet/chanakya.ts
- src/lib/spidernet/brain-manager.ts
- src/lib/spidernet/ollama-manager.ts
- src/lib/spidernet/storage.ts
- src/lib/spidernet/data.ts
- scripts/spidernet-coding-launcher.sh
- scripts/spidernet-local-code-status.sh
- scripts/spidernet-local-code-quickcheck.sh

Your mission:
1. Audit the current SETU repo truth from code, not assumptions.
2. Identify stale launcher logic, if any.
3. Identify architectural or safety gaps that should be improved now versus deferred.
4. Suggest the smallest safe set of improvements.
5. Finalize that plan internally.
6. Apply only the changes that are justified, minimal, and safe.
7. Verify everything you changed using real commands.
8. Report:
   - repo truth
   - what was stale
   - what was improved
   - what was intentionally deferred
   - what actually passed verification
   - any remaining risks

Priority target:
- Wire coding-flow.ts into the live Dash 001 intake path in the smallest safe way if the current code shows that this is still missing.
- Fix launcher truth so it correctly reflects the real local coding lane, including .venv-tools/bin/aider if present.

Implementation constraints:
- Keep existing behavior alive.
- Do not break intake redirect behavior.
- Do not remove compatibility bridges unless absolutely required.
- Avoid broad refactors.
- Prefer adding typed guards and minimal orchestration over redesign.

Required verification after changes:
- npm run build
- ./scripts/spidernet-coding-launcher.sh status
- ./scripts/spidernet-coding-launcher.sh check || true
- ./scripts/spidernet-local-code-status.sh || true
- ./scripts/spidernet-local-code-quickcheck.sh || true

If a dev server is already running on port 3000, also verify:
- curl -I http://127.0.0.1:3000/
- curl -I http://127.0.0.1:3000/boards/input-data
- curl -s -o /tmp/setu_post.html -D /tmp/setu_post_headers.txt -X POST http://127.0.0.1:3000/api/spidernet/intake
- cat /tmp/setu_post_headers.txt

Rules for truthfulness:
- Never write "verified" for anything that was not actually checked in this run.
- Clearly separate:
  - verified in this run
  - inferred from code
  - deferred / not yet proven

Output style:
- Be concise but complete.
- Prefer a final markdown report in the terminal.
PROMPT

echo "[INFO] Starting Codex SETU audit/apply run in: $ROOT"

# Safer unattended mode inside workspace only:
# codex exec --cd "$ROOT" --ask-for-approval never --sandbox workspace-write \
#   -m gpt-5.4 \
#   "$(cat .codex/prompts/setu_audit_and_apply_prompt.txt)" \
#   | tee ".codex/logs/setu_audit_$(date +%Y%m%d_%H%M%S).log"

# Strongest no-prompt mode. Use only because this is your own trusted local repo.
codex exec \
  --cd "$ROOT" \
  --dangerously-bypass-approvals-and-sandbox \
  -m gpt-5.4 \
  "$(cat .codex/prompts/setu_audit_and_apply_prompt.txt)" \
  | tee ".codex/logs/setu_audit_$(date +%Y%m%d_%H%M%S).log"

echo
echo "[DONE] Codex run finished."
echo "[INFO] Review logs under .codex/logs/"
