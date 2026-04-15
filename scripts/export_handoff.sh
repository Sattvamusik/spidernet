#!/usr/bin/env bash
set -euo pipefail

REPO="/home/sattv/projects/spidernet-control-deck"
HANDOFF="$REPO/.handoff"

mkdir -p "$HANDOFF"

cd "$REPO"

BRANCH="$(git branch --show-current)"
HEAD_COMMIT="$(git rev-parse --short HEAD)"

cat > "$HANDOFF/00-current-state.md" <<STATE
# Current State

## Repo
- Code repo: /home/sattv/projects/spidernet-control-deck
- Context workspace: /home/sattv/SpiderNet_Control/08_HIVE/DRISHTI
- Branch: $BRANCH

## Latest verified commits
- e8408ee — Brain v1: read-only file-backed posture scaffold (Option B)
- e5e735f — Brain v1: expose file-backed posture in dashboard snapshot
- 33096fb — Brain v1: render file-backed posture in observatory board

## Verified checks
- npm run lint ✅
- npx tsc --noEmit ✅
- npm run build ✅

## Locked rules
- Brain v1 is read-only
- No setTierPosture()
- No brain-manager changes
- No intake changes
- No mission writing
- No Ollama handshake work
- No specialist registry work

## Current architecture truth
- brain scaffold exists
- snapshot exposes brainPosture
- observatory board renders file-backed posture
- old brainStatus path remains as compatibility bridge

## Next recommended step
- Create and maintain repo-based handoff protocol
- Then decide whether to keep compatibility bridge for one more step or start controlled cleanup
STATE

cat > "$HANDOFF/01-decisions.md" <<'DECISIONS'
# Locked Decisions

1. Option B approved: read-only Brain v1 only
2. Corruption behavior: throw, do not silently recover
3. Schema mismatch: hard fail
4. Timestamps stay out of storage.ts
5. Atomic write required for future write path
6. Compatibility bridge allowed temporarily between brainStatus and brainPosture
7. Code repo is /home/sattv/projects/spidernet-control-deck
8. DRISHTI is context workspace, not the app repo
DECISIONS

cat > "$HANDOFF/02-open-loops.md" <<'LOOPS'
# Open Loops

1. Decide next step:
   - compatibility cleanup, or
   - future write-path/ledger design

2. Confirm whether /home/sattv/SpiderNet_Control/spidernet-dashboard is a mirror or drift copy

3. Adopt handoff protocol as mandatory before future thread transfers
LOOPS

cat > "$HANDOFF/03-commands.sh" <<CMDS
#!/usr/bin/env bash
set -euo pipefail
cd /home/sattv/projects/spidernet-control-deck || exit 1
git status --short
git log --oneline -8
npm run lint
npx tsc --noEmit
npm run build
CMDS
chmod +x "$HANDOFF/03-commands.sh"

cat > "$HANDOFF/04-verify.txt" <<VERIFY
Last known verification:
- npm run lint ✅
- npx tsc --noEmit ✅
- npm run build ✅

Latest verified commit context:
- e8408ee
- e5e735f
- 33096fb

Generated at: $(date -Iseconds)
VERIFY

cat > "$HANDOFF/05-repo-facts.txt" <<FACTS
CODE_REPO=$REPO
CONTEXT_WORKSPACE=/home/sattv/SpiderNet_Control/08_HIVE/DRISHTI
BRANCH=$BRANCH
HEAD_COMMIT=$HEAD_COMMIT
GENERATED_AT=$(date -Iseconds)
FACTS

{
  echo "=== git status --short ==="
  git status --short
  echo
  echo "=== latest commits ==="
  git log --oneline -8
} > "$HANDOFF/06-diff-summary.txt"

cat > "$HANDOFF/manifest.json" <<MANIFEST
{
  "project": "spidernet-control-deck",
  "code_repo": "/home/sattv/projects/spidernet-control-deck",
  "context_workspace": "/home/sattv/SpiderNet_Control/08_HIVE/DRISHTI",
  "branch": "$BRANCH",
  "latest_commit": "$HEAD_COMMIT",
  "verified": {
    "lint": true,
    "tsc_no_emit": true,
    "build": true
  },
  "scope_lock": {
    "brain_v1_mode": "read_only",
    "setTierPosture": false,
    "touch_brain_manager": false,
    "touch_intake": false,
    "touch_mission": false,
    "touch_ollama": false,
    "touch_specialist_registry": false
  },
  "next_step": "maintain handoff bundle and decide controlled cleanup vs next architecture phase"
}
MANIFEST

echo "Handoff bundle refreshed at $HANDOFF"
