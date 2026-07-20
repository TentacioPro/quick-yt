# 10 — Integration Hardening

## GOAL
Verify that the mobile application and the Express sync-server communicate correctly over the network under real end-to-end HTTP requests. Start the Express sync-server on port 4000, trigger the mobile app's backup and restore workflows, confirm that the database is transmitted, snapshots are captured, and response codes return 200 OK. Cleanly shut down the background sync-server via PID termination.

## MODULE SPECS IN SCOPE
- `specs/modules/sync-protocol.spec.md` — HTTP handshake compatibility.
- `specs/modules/gfs-retention.spec.md` — Snapshot verification on actual disk writes.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| DevSyncManager | `apps/mobile/src/sync/DevSyncManager.ts` | Dispatches database backups. |
| Express Server | `tools/sync-server/src/index.ts` | Receives and stores backups. |

## FILE SCOPE
Only the following files may be created or modified:

```text
apps/mobile/__tests__/sync/realIntegration.test.ts (modify/verify — real HTTP tests)
specs/tasks/10-integration-hardening-decisions.md (create)
specs/tasks/10-integration-hardening.state.md     (update)
```

## TDD CONTRACT

### 1. New Test Suites

#### `apps/mobile/__tests__/sync/realIntegration.test.ts`
- Assert that calling `backupToPC()` makes a real multipart POST request to port 4000, returns status 200, and triggers success toast.
- Assert that calling `restoreFromPC()` makes a real GET request to port 4000, returns status 200, and triggers success toast.

### 2. Regression Assertions
- All 59 mobile tests must remain green.

## OUT OF SCOPE
- No modifications to the mobile UI or Zustand stores.

## DONE MEANS
- [ ] Local server is run natively and E2E tests execute successfully.
- [ ] Server process is successfully terminated.
- [ ] State Closed.
