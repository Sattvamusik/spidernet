# SpiderNet Phase 1 Inventory

## Real and working
- `src/lib/spidernet/harness.ts`
- `src/lib/spidernet/socrates.ts`
- `src/lib/spidernet/chanakya.ts`
- `src/lib/spidernet/brain-manager.ts`
- `src/lib/spidernet/ollama-manager.ts`
- `src/lib/spidernet/coding-flow.ts`
- `scripts/spidernet-phase1-check.sh`
- `scripts/spidernet-phase1-dev.sh`
- `scripts/spidernet-phase1-status.sh`

## Inventory / bridge / not final truth
- Harness ledger append is still a placeholder hook.
- Brain manager is policy logic only and does not switch live providers automatically.
- Ollama manager is availability logic only and does not yet perform real model execution.
- Coding flow is a safe orchestration layer and not yet a real multi-agent runtime.
- Compatibility bridge fields elsewhere in SETU remain inventory until domain types are tightened.

## Phase 1 command set
- `scripts/spidernet-phase1-check.sh`
- `scripts/spidernet-phase1-dev.sh`
- `scripts/spidernet-phase1-status.sh`
