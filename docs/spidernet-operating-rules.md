# SpiderNet Operating Rules

## Core position
This project follows SpiderNet production rules:
- production-ready, not toy showcase code
- novice-safe execution
- exact paths and clean structure
- security-first handling
- reproducible workflow
- logs and plans must stay current

## Four lanes
- Architect: plan, structure, risks, sequencing
- Builder: code, scripts, services
- Auditor: tests, diffs, security, quality checks
- Operator: run, logs, health, restart verification

## Minimum starting files
- AGENTS.md
- README.md
- .gitignore
- .env.example
- docs/architecture.md

## Mandatory tracking
- plans/backlog.md
- plans/phase-01.md
- plans/ftd.md
- logs/worklog.md
- logs/changes.md

## Screenshots
Use screenshots heavily for:
- UI direction
- bug states
- logs/errors
- competitor/reference apps

## Web/docs lookup
Use docs and web lookup for:
- API syntax
- SDK behavior
- framework version issues
- deployment steps

## Secret handling
- never hardcode secrets
- never commit secrets
- never expose real keys in repo
- prefer local env entry, secret manager, or OS keychain

## Permission model
Default:
- workspace write
- on-request approvals

Higher privileges only for:
- isolated sandboxes
- throwaway prototypes
- explicitly approved risky work

## Safer YOLO policy
YOLO is allowed only when:
- project scope is isolated
- Git exists
- rollback path exists
- secrets are untouched
- user approved the risky phase

YOLO is not for:
- root filesystem cleanup
- secret files
- workstation-wide destructive changes
- changes outside project root

## Test ladder
For each meaningful phase:
1. lint
2. type check
3. test suite if present
4. smoke run locally
5. inspect logs
6. capture visible proof if UI exists
7. verify restart path
8. then mark done

## Definition of done
A phase is done only when:
- code builds or scaffold is verified
- app/service starts
- logs are acceptable
- tests or smoke checks pass
- docs updated
- worklog updated
- FTD updated
- restart path verified
