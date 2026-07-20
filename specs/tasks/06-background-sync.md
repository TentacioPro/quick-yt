# 06 — Background Task Metric Sync

## GOAL
Implement an autonomous background task on the mobile device using `expo-task-manager` and `expo-background-fetch` that runs when the app is backgrounded. This task will check for any unsynced `audit_logs` in SQLite and, if the local PC sync server is reachable, transmit them to a new Express endpoint `POST /api/sync/metrics` on Port 4000. Upon successful transmission, the synced logs must be marked as `synced` in the local SQLite database.

## MODULE SPECS IN SCOPE
- `specs/modules/sync-protocol.spec.md` — Sync payload definitions and endpoints.
- `specs/modules/db-layer.spec.md` — Database schemas and columns.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Drizzle schema | `apps/mobile/src/db/schema.ts` | Expand `auditLogs` schema to add `synced` integer field. |
| DB client accessors | `apps/mobile/src/db/client.ts` | Read unsynced logs and update their status. |
| Express server router | `tools/sync-server/src/index.ts` | Add new metrics endpoint and disk persistence. |

## FILE SCOPE
Only the following files may be created or modified:

```text
apps/mobile/src/db/schema.ts                       (modify — add synced column to auditLogs)
apps/mobile/src/sync/BackgroundSyncTask.ts         (create)
apps/mobile/__tests__/sync/backgroundSync.test.ts  (create)
tools/sync-server/src/index.ts                     (modify — add /api/sync/metrics route)
tools/sync-server/__tests__/server.test.ts         (modify — test /api/sync/metrics)
specs/modules/db-layer.spec.md                     (update)
specs/modules/sync-protocol.spec.md                (update)
specs/tasks/06-background-sync-decisions.md        (create)
specs/tasks/06-background-sync.state.md            (update)
```

## TDD CONTRACT

### 1. New Test Suites

#### `tools/sync-server/__tests__/server.test.ts` (expansion)
- Assert `POST /api/sync/metrics` accepts array of audit logs, returns `{ success: true }`, and saves it to `.dev-backups/metrics_log.json`.
- Assert `POST /api/sync/metrics` rejects invalid payloads (e.g. object instead of array) with Zod validation.

#### `apps/mobile/__tests__/sync/backgroundSync.test.ts`
- Assert background task checks database for unsynced logs (where `synced = 0`).
- Assert background task does nothing if there are zero unsynced logs.
- Assert background task dispatches metrics payload to `${PC_IP}/api/sync/metrics`.
- Assert background task updates SQLite database setting `synced = 1` for successfully synced logs.
- Assert background task handles connection errors gracefully without crashing the background thread.

### 2. Regression Assertions
- All 48 existing workspace tests must remain green.

## OUT OF SCOPE
- No modifications to the visual app screen loaders.
- No user configuration toggles for sync intervals.

## DONE MEANS
- [ ] Both new test suites and modifications pass green.
- [ ] 48/48 regression tests remain green.
- [ ] `06-background-sync-decisions.md` written.
- [ ] Database schema changes verified (synced column added).
- [ ] Specs updated.
- [ ] Console test runner evidence appended to state file.
