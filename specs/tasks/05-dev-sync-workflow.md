# 05 — Local Dev Sync Server & Manager

## GOAL
Implement the bidirectional SQLite database synchronization workflow between the Expo mobile app and the local Express server. The server must validate multipart uploads via Zod, enforce `.db` extension, and return standardized JSON error responses. The mobile app must upload/download the database using `expo-file-system`, trigger toast notifications and haptic alerts, and write execution status metrics to the audit log via `withAuditCatch`. Ensure 100% test coverage on `DevSyncManager` payload formatting.

## MODULE SPECS IN SCOPE
- `specs/modules/sync-protocol.spec.md` — HTTP routes, method definitions, IP settings, and device paths.
- `specs/modules/error-contract.spec.md` — Canonical JSON error schema and response codes.
- `specs/modules/validation-guardrails.spec.md` — Zod backup validation rules.
- `specs/modules/ui-ux.spec.md` — Haptics and Toast notifications.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Drizzle DB client | `apps/mobile/src/db/client.ts` | Source SQLite DB path matches `FileSystem` sync parameters. |
| useToastStore | `apps/mobile/src/store/useToastStore.ts` | Displays Snackbar alerts on sync achievements or connection timeouts. |
| withAuditCatch | `apps/mobile/src/db/withAuditCatch.ts` | Captures synchronization outcomes and network latency metrics to SQLite. |

## FILE SCOPE
Only the following files may be created or modified:

```text
tools/sync-server/src/errors.ts                    (create)
tools/sync-server/src/validation.ts                (create)
tools/sync-server/src/index.ts                     (modify — full implementation)
tools/sync-server/__tests__/server.test.ts         (create)
apps/mobile/src/sync/DevSyncManager.ts             (create)
apps/mobile/__tests__/sync/devSyncManager.test.ts  (create)
specs/modules/sync-protocol.spec.md                (update)
specs/modules/validation-guardrails.spec.md         (update)
specs/tasks/05-dev-sync-workflow-decisions.md      (create)
specs/tasks/05-dev-sync-workflow.state.md          (update)
```

## TDD CONTRACT

### 1. New Test Suites

#### `tools/sync-server/__tests__/server.test.ts`
- Assert health check endpoint `/api/sync/status` returns success.
- Assert database upload `/api/sync/backup` stores file correctly when a valid `.db` file is uploaded.
- Assert database restore `/api/sync/restore` returns the correct backup file.
- Assert uploading a `.txt` file returns `INVALID_FILE_TYPE` error code and returns HTTP 400.
- Assert uploading without a database field returns `NO_FILE_UPLOADED` error code and returns HTTP 400.
- Assert restore returns `BACKUP_NOT_FOUND` when no backup exists and returns HTTP 404.
- Assert all error outputs adhere strictly to the `ApiErrorResponse` type definition.

#### `apps/mobile/__tests__/sync/devSyncManager.test.ts`
- Assert `backupToPC` triggers `FileSystem.uploadAsync` with correct multipart field, URL, and target filepath.
- Assert `restoreFromPC` triggers `FileSystem.downloadAsync` and reloads app via `Updates.reloadAsync()`.
- Assert successful sync operations trigger a toast with `success`.
- Assert failed sync operations write to audit logs with `status: 'failed'`, re-throw, and trigger a toast with `error`.
- Ensure 100% coverage on `DevSyncManager` file parsing and payload creation.

### 2. Regression Assertions
- All 41 existing workspace tests must remain green.

## OUT OF SCOPE
- No direct container deployment validation inside these unit tests (Dockerfile is verified statically).
- No production database replication or cloud backups.

## DONE MEANS
- [ ] Both new test suites pass green.
- [ ] 41/41 regression tests remain green.
- [ ] 100% coverage achieved on `DevSyncManager.ts`.
- [ ] `05-dev-sync-workflow-decisions.md` written.
- [ ] `sync-protocol.spec.md` and `validation-guardrails.spec.md` updated.
- [ ] Terminal test logs appended to state tracker.
