# Architecture

## Goal
Run SpiderNet Control Deck as the main SETU web product with the validated DRISHTI Phase 5 operating-law architecture translated into the existing Next.js shell.

## Core model
- locked six-board purpose model
- four-lane operating model: Architect, Builder, Auditor, Operator
- route families: DNA, RUL, LIB, BLP, FTD
- typed workflow packets: intake, research, approval, execution, validation, pass
- policy checks before routing
- registry-driven architecture
- append-only ledger and vault storage

## Board purpose locks
- Dash 001: SETU Input Terminal
- Dash 002: Research Tools
- Dash 003: Hive Orchestrator
- Dash 004: Specialist Task Execution
- Dash 005: Observatory
- Dash 006: Memory & Ledger

Dash 002 is research-only. It compares tools, fit, worth-doing, and exposure choices. It does not act as an execution surface.

## Storage model
Durable local storage now lives in:
- `artifacts/runtime/spidernet/packets`
- `artifacts/runtime/spidernet/registries`
- `artifacts/runtime/spidernet/vaults`
- `artifacts/runtime/spidernet/ledger`
- `artifacts/runtime/spidernet/config`

The app seeds these files on first run if they do not exist. Packet, vault, wrapper, skill, score-memory, ledger, and Ollama-prep data are file-backed instead of kept only in code memory.

## Routing model
1. Intake packets are loaded.
2. Policy checks run before routing.
3. Saarthi produces synthesis and proposed route.
4. Chitragupt readiness gates determine whether the path is ready, review, hold, or prepared.
5. Wrapper exposure path is recorded as one of:
   - API
   - CLI
   - browser automation
   - desktop automation
   - manual hold

## Live vs prepared
Live:
- six board surfaces in the web shell
- durable packet persistence
- local vault storage
- policy enforcement before routing
- wrapper registry linkage
- skill registry display
- score-memory storage
- manager synthesis logic
- readiness-gate display

Prepared only:
- Ollama config and handshake posture
- browser automation exposure path
- desktop automation exposure path

## Stack
- Next.js 16
- React 19
- Tailwind 4
- repo-local JSON storage for current Phase 6 durability work
