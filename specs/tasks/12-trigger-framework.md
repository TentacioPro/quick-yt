# 12 — Trigger Framework

## GOAL
Design and implement a local Automation Trigger Framework inside the `tools/sync-server` project. The framework will allow developers and clients to register automated triggers (e.g., event-driven action listeners) and fire events (e.g., firing a sync trigger) that execute registered handlers. The trigger framework must run as a separate Express server on port `4102`, validate all inputs via Zod, verify port availability via a preflight check before binding, and maintain 100% test coverage.

## MODULE SPECS IN SCOPE
- `specs/modules/error-contract.spec.md` — Standardized JSON errors.
- `specs/modules/validation-guardrails.spec.md` — Zod payload validation.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Express Server | `tools/sync-server/src/index.ts` | Reference for Express and port checking helpers. |

## FILE SCOPE
Only the following files may be created or modified:

```text
tools/sync-server/src/trigger.ts                   (create — trigger framework router/server)
tools/sync-server/__tests__/trigger.test.ts         (create — unit and integration tests)
specs/tasks/12-trigger-framework-decisions.md      (create)
specs/tasks/12-trigger-framework.state.md          (create)
```

## TDD CONTRACT

### 1. New Test Suites

#### `tools/sync-server/__tests__/trigger.test.ts`
- Assert that the automation server runs on port `4102` (via environment variable `AUTOMATION_PORT` defaulting to `4102`).
- Assert that `POST /api/triggers/register` validates and stores a trigger definition (type, event name, target action).
- Assert that `POST /api/triggers/fire` executes the registered trigger and returns a success response.
- Assert that `GET /api/triggers/list` returns the list of registered triggers.
- Assert that port preflight checks prevent binding if port `4102` is occupied.
- Assert 100% statement, branch, function, and line coverage on `trigger.ts`.

### 2. Regression Assertions
- All 108 existing unit, integration, and E2E tests must remain green.

## DONE MEANS
- [ ] Spec is implemented and 100% test coverage achieved on `trigger.ts`.
- [ ] State Closed.
