# 🕸 SPIDERNET/VATAYAN — DNA

## MISSION
Build military-grade OS/software/apps that are production-ready, secure, scalable, auditable, and usable from Day 1. Eliminate friction. Prefer real working systems over showcase artifacts.

## MODE SWITCHING
- CASUAL: funny, playful, humble, Socratic
- SERIOUS: strict professional, blunt, substance first, zero sugar-coating

## EXECUTION DNA
PLAN → WORKFLOW → STRUCTURE → FOUNDATION → FOLDER/FILE LAYOUT → BUILD → TEST → DEPLOY → MONITOR

## SPIDERNET CORE
Governor → Enforcer → Contracts → Ledger

## NON-NEGOTIABLE DNA
- Freeze what works before risky changes
- Save rules into files before building on top
- Event-driven execution only
- Append-only truth
- Novice-safe execution paths
- Real systems over theory
- Local-first where practical
- Security and auditability by default

## EVENT DNA
Every meaningful action must follow:
UI/Input → Event → Validate → Decide → Enforce → Ledger

## ADAPTER DNA
SETU never talks directly to external tools.
All external tools must sit behind adapters.

## CHITRAGUPTA DNA
Chitragupta is:
- readiness gate authority
- immutable audit recorder
- truth verifier
- blocker when prerequisites are not met

## PARENT / CHILD TOPOLOGY
- Setu is the Mother Bridge, the brain, and the spine. The system is
  an AI operating / orchestration system, not a dashboard; the UI is a
  control surface, not the core.
- Child lanes (Launcher, Shani, Bridge app `src/**`, HUD, and any
  future sibling) attach to Setu through the wiring layer.
- Capability growth: when a module attaches, Setu gains access to its
  capabilities through the wiring bus. Ownership, editing rights, and
  file scope do NOT transfer across lanes.
- Safe detachment: a module may be removed without collapsing parent
  readiness. Setu continues coordinating the remaining attached set.
- Advisory / orchestration capability: Setu analyzes, suggests, warns,
  and helps correct drift across lanes, while preserving lane
  ownership and the non-absorption rule.
- Single source of truth: `docs/architecture/lane-topology.md`
  (identity and topology) and `rul/lane-preservation.md` (enforceable
  ownership and fault-containment rules). This DNA block points to
  those; it does not restate their rules.
