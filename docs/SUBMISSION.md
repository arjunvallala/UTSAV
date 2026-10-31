# Utsav submission notes

## Overview

Utsav is a local-first event planning studio for celebrations. It combines a sample wedding dashboard, transparent scenario budgets, dependency-aware timeline suggestions, a vendor shortlist, contextual ideas, and an optional server-side Gemini assistant.

## Architecture and technical highlights

See [ARCHITECTURE.md](./ARCHITECTURE.md). TypeScript strict mode, Zod schemas, deterministic budget/readiness calculations, local persistence, CSV/JSON/ICS exports, explicit reschedule proposals, same-origin request checks and offline AI fallback are implemented.

## GenAI

Provider: Google Gemini, using `@google/genai`. Default model: `gemini-3.8-flash`, override with `GEMINI_MODEL`. Google's [model catalog](https://ai.google.dev/gemini-api/docs/models) lists Gemini 3.8 Flash among current stable models and recommends current Flash models for new projects (checked 2026-10-31). Confirm account access at deployment time. The key is server-only. No AI call is made without a user request.

## Evaluation traceability

| Criterion         | Evidence                                                                                        | Current status                                         |
| ----------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Code quality      | strict TS, domain/UI/AI separation, schemas                                                     | Implemented baseline                                   |
| Security          | request bounds, same-origin, headers, server key                                                | Partial; distributed quota and scans remain            |
| Efficiency        | compact context, memoized dashboard state, response cache                                       | Partial; cache is process-local                        |
| Testing           | deterministic domain unit tests                                                                 | Partial; no browser, axe, AI eval or coverage evidence |
| Accessibility     | focus, labels, semantics, reduced motion, responsive layout                                     | Partial; axe and manual audit outstanding              |
| Problem alignment | planning dashboard, budget, tasks, vendor shortlist slots, ideas, readiness, simulator, exports | Partial; intake and several workflow details remain    |

## Test evidence

See [TESTING.md](./TESTING.md). Record actual commands/results here after running them; no successful result is claimed yet.

## Limitations

No full event intake form, real task dependency editor, event-day time grid, vendor payment/deposit ledger, PDF export, actual Gemini credential validation, Playwright/axe pipeline, GitHub Actions, Docker or Cloud Run smoke test yet. Multi-process daily AI quotas require shared infrastructure.

## Two-minute demonstration script

1. Open the preloaded Jaipur wedding dashboard and point out countdown, readiness, spend, tasks and vendor progress.
2. Open Budget; compare Economical, Balanced and Premium allocations, then log an actual payment.
3. Open Timeline; propose a vendor task delay and inspect the dependent date changes before approving.
4. Use What if? to try additional guests and a budget reduction; show that the plan is unchanged.
5. Open Vendors to review a quote against its allocation; note that unknown quotes remain blank.
6. Ask Utsav for ideas. With no key configured, show the offline response; with a key, show a generated proposal without auto-applying it.
7. Export ICS/JSON and show local data controls.

## LinkedIn announcement draft

I built Utsav, a thoughtful event-planning platform that pairs practical AI suggestions with deterministic budgeting, explainable readiness scores and explicit approval for plan changes. It includes a fully populated sample wedding, local-first data controls, accessible responsive views and an offline assistant fallback. The project is designed to make AI useful without handing it the keys to the plan.

## Submission checklist

- [ ] Install dependencies and record lint, typecheck, test, build output.
- [ ] Add route integration, AI evaluation, Playwright journeys and axe checks.
- [ ] Verify Gemini credential and current model in deployment environment.
- [ ] Complete privacy, keyboard, screen-reader and zoom checks.
- [ ] Add CI security/secret scans and shared quota store.
- [ ] Build Docker image and smoke-test Cloud Run deployment.
- [ ] Record Lighthouse mobile performance and coverage evidence.
- [ ] Capture the demonstration video using the script above.
