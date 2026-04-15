#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROMPT_FILE="${PROJECT_DIR}/prompts/finish_existing_spidernet_dashboard.txt"
REF_IMAGE="${PROJECT_DIR}/reference/ui_reference.png"
LOG_FILE="${PROJECT_DIR}/logs/codex_finish_$(date +%Y%m%d_%H%M%S).log"

cd "${PROJECT_DIR}"

if [ -f "${REF_IMAGE}" ]; then
  codex exec \
    --cd "${PROJECT_DIR}" \
    --skip-git-repo-check \
    --sandbox danger-full-access \
    --image "${REF_IMAGE}" \
    "$(cat "${PROMPT_FILE}")" | tee "${LOG_FILE}"
else
  codex exec \
    --cd "${PROJECT_DIR}" \
    --skip-git-repo-check \
    --sandbox danger-full-access \
    "$(cat "${PROMPT_FILE}")" | tee "${LOG_FILE}"
fi
