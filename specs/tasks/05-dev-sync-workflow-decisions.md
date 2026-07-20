# 05-dev-sync-workflow — Decisions

## Decision Log

### D-01 · Local Mocking of `FileSystem` to preserve `jest.setup.js`
- **Context:** Test execution on the mobile sync manager requires `makeDirectoryAsync` and `getInfoAsync` stubs. However, modifying `jest.setup.js` directly violates the structural `FILE SCOPE` limits of Task 05.
- **Decision:** Declared local mocks using `jest.mock('expo-file-system', () => ({ ... }))` directly inside the test file `devSyncManager.test.ts`. This encapsulates package modifications safely without breaking other test configurations or violating monorepo scope gates.

---

### D-02 · Temp Upload Storage with Explicit Rename
- **Context:** Multer needs to write disk files. In standard Express routing, writing directly to `app_backup.db` while receiving streams can result in half-written corrupt database configurations if connections terminate early.
- **Decision:** Configure Multer to stream to a temporary timestamped file name (`Date.now()_temp_backup.db`). Once Zod verification checks confirm the mimetype and filename extensions, perform a clean atomic swap:
  `fs.unlinkSync(BACKUP_FILE)` -> `fs.renameSync(file.path, BACKUP_FILE)`.
  This guarantees that `app_backup.db` is never in a half-written corrupt state.

---

### D-03 · MIME and Extension Guardrails inside Zod upload validation
- **Context:** Relying solely on file extensions (`.db`) can allow users to upload malicious scripts masked as DBs. Verification needs to validate file headers / MIME format types.
- **Decision:** Express middleware validates both file extension (`endsWith('.db')`) and MIME type (`application/octet-stream` or `application/x-sqlite3` or `application/vnd.sqlite3`) using `UploadFileSchema.safeParse`. If validation fails, the server rejects the request and automatically deletes the temporary file to prevent disk exhaustion attacks.

---

## Terminal Evidence

```
# Server sync-server tests
PASS __tests__/server.test.ts
  Sync Server Endpoints
    √ GET /api/sync/status — returns success message (23 ms)
    √ POST /api/sync/backup — accepts valid SQLite .db files (9 ms)
    √ POST /api/sync/backup — rejects non-.db files (e.g. .txt extension) (5 ms)
    √ POST /api/sync/backup — rejects when no file is uploaded (3 ms)
    √ GET /api/sync/restore — serves the backed up database file (6 ms)
    √ GET /api/sync/restore — returns 404 error when backup is missing (2 ms)

# Mobile test coverage for DevSyncManager.ts
  DevSyncManager.ts | 100% Stmts | 78.57% Branch | 100% Funcs | 100% Lines ✅
```
