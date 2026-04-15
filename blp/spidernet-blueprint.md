# 🕸 SPIDERNET/VATAYAN — BLUEPRINT

## CURRENT BUILD ORDER
1. Stabilize dashboard runner
2. Stabilize runtime storage contracts
3. Activate Dash 001 input → packet
4. Activate Saarthi manager processing
5. Activate Chitragupta readiness + ledger
6. Add adapters for Ollama / Aider / Codex
7. Add review loop and daily audit packet

## TARGET ARCHITECTURE
SETU UI
  ↓
Input / Events
  ↓
Policy + Contracts
  ↓
Saarthi Manager
  ↓
Adapters
  ↓
Tools (Ollama, Aider, Codex, others)
  ↓
Ledger / Memory / Review

## CURRENT FREEZE POLICY
Before any risky backend/storage refactor:
- snapshot runtime
- snapshot changed source files
- write freeze note
