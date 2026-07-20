# 02 — Drizzle Schemas + withAuditCatch + Jest TDD Harness

## GOAL
Implement the Drizzle ORM schema file (`schema.ts`), the database client (`client.ts`), the audit log insertion wrapper (`audit.ts`), and the unified error-catching HOF (`withAuditCatch.ts`) — all in `apps/mobile/src/db/`. All four files must be covered by passing Jest tests with `expo-sqlite` mocked. `audit.ts` and `withAuditCatch.ts` must reach 100% line/branch coverage.

## MODULE SPECS IN SCOPE
- `specs/modules/db-layer.spec.md` — schema definitions, Drizzle client config, expo-sqlite constraints.
- `specs/modules/error-contract.spec.md` — `withAuditCatch` failure shape and audit log `status: 'failed'` requirement.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Schema source of truth | `02_Architecture_and_TDD.md` (L27–L48) | Copy exact column definitions; no deviation permitted. |
| Jest mock stubs | `apps/mobile/jest.setup.js` | `expo-sqlite` mock already wired. Tests import mocked DB automatically. |
| Jest config | `apps/mobile/jest.config.js` | Existing config used; per-file 100% coverage threshold added for audit files. |
| Error contract spec | `plan.md` § Phase 2 + v2 amendments | `withAuditCatch` HOF shape and `status:'failed'` audit log requirement. |

## FILE SCOPE
Only the following files may be created or modified:

```text
apps/mobile/src/db/schema.ts             (create)
apps/mobile/src/db/client.ts             (create)
apps/mobile/src/db/audit.ts              (create)
apps/mobile/src/db/withAuditCatch.ts     (create)
apps/mobile/__tests__/db/schema.test.ts  (create)
apps/mobile/__tests__/db/audit.test.ts   (create)
apps/mobile/__tests__/db/withAuditCatch.test.ts (create)
apps/mobile/jest.config.js               (modify — add per-file 100% coverage thresholds)
specs/modules/db-layer.spec.md           (update)
specs/modules/error-contract.spec.md     (update)
specs/tasks/02-drizzle-schemas-tdd-decisions.md (create)
specs/tasks/02-drizzle-schemas-tdd.state.md     (update)
```

## TDD CONTRACT

### 1. New Suite Additions — Write FIRST, must fail on empty implementation

| Test File | Assertions |
|---|---|
| `__tests__/db/schema.test.ts` | ① `videos` table export has columns: id, url, title, timestampAdded, transcriptRaw, markdownReport, status. ② `auditLogs` table export has columns: id, action, entityId, performanceMs, timestamp, status. ③ `status` column on `videos` has default value `'pending'`. |
| `__tests__/db/audit.test.ts` | ① `logAction()` calls `db.runAsync` with INSERT SQL. ② Inserted row contains `action`, `entityId`, `performanceMs`, `status` fields. ③ `id` is auto-generated (non-empty string). ④ `timestamp` is auto-generated (positive integer ≈ `Date.now()`). |
| `__tests__/db/withAuditCatch.test.ts` | ① Successful `fn()` → logs `status:'success'` with measured `performanceMs > 0`. ② Returns the resolved value of `fn()`. ③ Throwing `fn()` → logs `status:'failed'` and re-throws the original error. ④ `entityId: null` handled without error. |

### 2. Regression Assertions
- `__tests__/store/useToastStore.test.ts` — must remain 3/3 green throughout.

## OUT OF SCOPE
- No Drizzle migrations or `drizzle-kit` invocation. Migrations are handled inline via `initDatabase()` SQL strings.
- No Zustand store changes.
- No UI components.
- No `jest.setup.js` changes (mocks already present from Task 01).
- No sync-server files.

## DONE MEANS
- [ ] All 3 test suites (schema, audit, withAuditCatch) pass with zero failures.
- [ ] `useToastStore.test.ts` remains green (regression check).
- [ ] 100% line + branch coverage on `audit.ts` and `withAuditCatch.ts`.
- [ ] `02-drizzle-schemas-tdd-decisions.md` written.
- [ ] `specs/modules/db-layer.spec.md` and `error-contract.spec.md` updated.
- [ ] Terminal test summary pasted to state file.
