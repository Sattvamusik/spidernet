# AGENTS.md

## Project Overview
Project: SpiderNet Control Deck — a web-based internal operations console for SpiderNet system visibility, control, and disciplined execution
Target user: internal ops team
My skill level: beginner
Stack: Next.js + Node + Tailwind
Current phase: Phase 01 — Foundation

## Commands
Install: npm install
Dev: npm run dev
Build: npm run build
Test: [not defined in package.json yet]
Lint: npm run lint
Typecheck: [not defined as separate script yet]

## Non-Negotiables
- Build production-ready systems, not toy demos.
- Read existing code before modifying anything.
- Match existing patterns, naming, and style.
- Keep changes small and within scope.
- Handle errors clearly. No silent failure.
- Always validate after edits.
- Never claim done until the app or service is actually running.
- Update `logs/worklog.md` and `plans/ftd.md` after each phase.

## File and Folder Rules
- Work only inside the project root unless explicitly told otherwise.
- Use exact paths.
- Put architecture and process notes into `docs/`.
- Put plans into `plans/`.
- Put logs into `logs/`.
- Put scripts into `scripts/`.
- Put tests into `tests/`.
- Put outputs and screenshots into `artifacts/`.
- Do not scatter files across random locations.
- Prefer full corrected file generation over manual patch guidance.

## Security Rules
- Never hardcode secrets, API keys, or credentials.
- Never print or commit real secrets.
- Use `.env.example` placeholders only.
- Prefer local env entry, secret manager, or OS keychain.
- Do not touch real secrets unless explicitly required.
- Never paste real secrets into agent chat unless unavoidable.

## Git Rules
- Initialize Git before risky work.
- Use small, descriptive commits.
- Prefer feature branches for non-trivial work.
- Never force push.
- Never push or deploy without permission.
- Keep `main` stable.

## Test Rules
- Run lint after changes.
- Run typecheck if available.
- Run existing tests after changes.
- Add tests for new behavior when appropriate.
- Never skip or delete tests to make things pass.

## Logging Rules
- Record each phase in `logs/worklog.md`.
- Record meaningful file and behavior changes in `logs/changes.md`.
- Record blockers, fixes, and remaining work in `plans/ftd.md`.

## Do
- Read before changing.
- Ask concise clarifying questions when truly needed.
- Verify local run after meaningful edits.
- Use screenshots for UI, bug, and log context.
- Use docs/web lookup for version-sensitive behavior.

## Do Not
- Install new dependencies without approval.
- Delete or overwrite major files without approval.
- Rewrite working code without reason.
- Move outside scope.
- Pretend a phase is complete when it is not running.

## When Stuck
- Break the task into steps.
- State the blocker clearly.
- After 2 failed fix attempts, stop and explain the real issue.
- Propose the safest next move.

## Definition of Done
- Build passes or is not applicable.
- App/service starts.
- Logs look acceptable.
- Tests or smoke checks pass.
- Docs updated.
- Worklog updated.
- FTD updated.
- Restart path verified.

## Response Style
- Clear and concise.
- Plain English.
- Short paragraphs.
- No jargon unless needed.
