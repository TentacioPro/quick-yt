# 06-background-sync — Decisions

## Decision Log

### D-01 · DDL migration strategy for `synced` column
- **Context:** The `audit_logs` table needs to track synced status. We added the `synced: integer('synced').default(0)` column to `schema.ts`. However, existing devices might already have the database file `app.db` created without the `synced` column.
- **Decision:** Updated `client.ts` in `initDatabase` to:
  1. Declare `synced INTEGER DEFAULT 0` in the `CREATE TABLE IF NOT EXISTS` schema definition.
  2. Run `ALTER TABLE audit_logs ADD COLUMN synced INTEGER DEFAULT 0;` inside a try/catch block.
  This dynamically adds the column if the table already existed, but gracefully ignores errors on subsequent launches.

---

### D-02 · Dynamic `require` statements in `backgroundSync.test.ts`
- **Context:** `BackgroundSyncTask.ts` executes a call to `TaskManager.defineTask` directly upon file import. Since Jest tests hoist mocks, and we execute `jest.clearAllMocks()` in `beforeEach`, normal imports at the top of the file would register and clear the call counts before any tests run.
- **Decision:** Loaded the module dynamically using `const { ... } = require('../../src/sync/BackgroundSyncTask')` inside individual test blocks. This permits resetting modules via `jest.resetModules()` in `afterEach` and reliably asserting the module-load behavior.

---

### D-03 · Disk metrics storage shape in Sync Server
- **Context:** The local sync server needs to accept metrics arrays from the mobile device. The server can either log it to a JSON log file or setup a complex SQLite database structure.
- **Decision:** Save metrics as a JSON array inside `.dev-backups/metrics_log.json`. On post, load the file, parse it, push the new metric logs, and write it back. This is simple, fast, and does not require another SQLite Drizzle kit migration logic on the server package.

---

## Terminal Evidence

```
# Server tests
PASS __tests__/server.test.ts
  Sync Server Endpoints
    POST /api/sync/metrics
      √ accepts and appends valid audit log payloads (11 ms)
      √ rejects payloads that are not arrays (3 ms)
      √ rejects arrays containing invalid audit log items (missing action) (4 ms)

# Mobile tests
PASS __tests__/sync/backgroundSync.test.ts
  BackgroundSyncTask
    √ defines the task correctly on module load (1068 ms)
    √ executes sync successfully when there are unsynced logs and server is online (26 ms)
    √ does nothing and returns NoData when there are no unsynced logs (20 ms)
    √ returns Failed and does not mark synced if sync-server is offline (23 ms)
    √ returns Failed if metrics submission endpoint fails (18 ms)
```
