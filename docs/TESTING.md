# Testing and evidence

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Domain unit tests cover schema validation, allocation invariants, budget utilities, deterministic readiness, simulation immutability and dependency-aware rescheduling. The configured domain line coverage gate is 90%; the complete definition-of-done target also requires 75% overall, route integration, AI evaluation fixtures, browser journeys and axe audits. No test result is claimed until recorded from actual command output.

The full brief additionally calls for route integration, AI evaluation fixtures, storage migration/corruption, browser journeys, axe audits and a 200-task performance target. These are not yet implemented. Coverage gates should be raised to the requested 90% domain/AI and 75% overall after the additional test suites land.
