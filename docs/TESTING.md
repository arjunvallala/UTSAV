# Testing and evidence

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Domain unit tests cover schema validation, allocation invariants, budget utilities, deterministic readiness, simulation immutability and dependency-aware rescheduling. The configured domain line coverage gate is 90%; the complete definition-of-done target also requires 75% overall, route integration, AI evaluation fixtures, browser journeys and axe audits. Only results supported by command output are recorded below.

## Recorded run (2026-11-01)

- `npm run lint` — passed with no warnings.
- `npm run typecheck` — passed (`tsc --noEmit`).
- `npm run test:coverage` — 11 tests passed; domain coverage 100% statements, branches, functions and lines.
- `npm run build` — passed on Next.js 16.4.3; standalone output preparation completed.
- `npm audit --omit=dev --audit-level=high` — 0 production vulnerabilities. The full audit reports 16 moderate advisories in development tooling.
- Manual local browser smoke check — dashboard rendered, timeline and simulator opened, schedule changes remained proposals, and assistant fallback responded without a Gemini key. This is not a Playwright or axe-core run.

The full brief additionally calls for route integration, AI evaluation fixtures, storage migration/corruption, browser journeys, axe audits and a 200-task performance target. These are not yet implemented. Coverage gates should be raised to the requested 90% domain/AI and 75% overall after the additional test suites land.
