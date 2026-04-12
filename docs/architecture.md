# Architecture

## Goal
Build a disciplined internal operations console for SpiderNet that can later expose service health, logs, workflow status, execution state, and controlled operational actions through a clean interface.

## Users
internal ops team

## Scope
Phase 01 covers foundation only:
- repository structure
- operating rules
- core documentation
- starter commands
- initial local environment setup
- initial Git baseline

## Out of scope
Phase 01 does not include:
- full UI implementation
- backend business logic
- production deployment
- real integrations
- authentication
- observability stack wiring

## Stack
Next.js + Node + Tailwind

## Main components
- UI: Next.js frontend
- API: Node/Next server routes
- storage: to be decided in a later phase
- background jobs: to be defined later if needed
- observability: to be defined later

## Data flow
1. User opens the ops console.
2. Frontend requests status or control data.
3. Application layer processes request.
4. Logs and checks are recorded.

## Service inventory
- service name: web app
- purpose: internal operations console
- port: 3000
- log location: terminal output initially
- start command: npm run dev
- stop command: Ctrl+C in terminal
- health check: app responds on localhost:3000

## Risks
- Commands are defined before full app scaffold exists.
- Real implementation is not started yet.
- Test and typecheck commands may need adjustment after scaffold generation.

## Guardrails
- Do not expose secrets.
- Keep `main` stable.
- Use small scoped changes.
- Validate after changes.
- Update worklog and FTD after each phase.
