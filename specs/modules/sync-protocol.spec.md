# Living Specification — Sync Protocol

> Last updated by: Task 05 — Local Dev Sync Server & Manager
> Driven by: `specs/tasks/05-dev-sync-workflow.md`
> Source truth: `04_DevSync_MCP_Server.md`

Enforces the bidirectional SQLite database synchronization protocol between the mobile app (Pixel 8a) and the local Windows development PC.

---

## 1. Network Constraints

- **Port:** `4000`
- **PC Server IP (Default):** `http://192.168.1.100:4000` (configurable parameter in `DevSyncManager.ts`).
- **Private Profile:** Windows host network profile must be set to "Private" to allow cross-device TCP requests on Port 4000.

---

## 2. API Endpoint Protocol

### `GET /api/sync/status`
- **Purpose:** Health check.
- **Success shape:**
  ```json
  { "success": true, "message": "Sync server is running." }
  ```

### `POST /api/sync/backup`
- **Purpose:** Receives multipart database stream and saves it to `.dev-backups/app_backup.db`.
- **Multipart Field:** `database`
- **Validations (Zod):**
  - Mimetype: `application/octet-stream` or `application/x-sqlite3` or `application/vnd.sqlite3`.
  - Extension: `.db`
- **Errors:**
  - `NO_FILE_UPLOADED` (400)
  - `INVALID_FILE_TYPE` (400)
  - `UPLOAD_FAILED` (500)

### `GET /api/sync/restore`
- **Purpose:** Downloads standard database file from server.
- **Success:** Serves binary file directly with mimetype `application/octet-stream`.
- **Errors:**
  - `BACKUP_NOT_FOUND` (404)
  - `INTERNAL_ERROR` (500)

### `POST /api/sync/metrics`
- **Purpose:** Receives array of audit log metrics and appends to local log file.
- **Validations (Zod):** Array of valid audit log objects (id, action, timestamp).
- **Success shape:**
  ```json
  { "success": true, "message": "Metrics synced successfully." }
  ```
- **Errors:**
  - `VALIDATION_ERROR` (400)
  - `INTERNAL_ERROR` (500)

---

## 3. Mobile Execution Lifecycle

### Backup Workflow
1. Await status verification check that the database file exists at `${FileSystem.documentDirectory}SQLite/app.db`.
2. Wrap call in `withAuditCatch` action `'SYNC_BACKUP'`.
3. Invoke `FileSystem.uploadAsync`.
4. If status is non-200, parse JSON message payload and throw error.
5. Success: Trigger Snackbar toast (`success`) with light haptic feedback.

### Restore Workflow
1. Ensure parents directory SQLite path exists.
2. Wrap call in `withAuditCatch` action `'SYNC_RESTORE'`.
3. Invoke `FileSystem.downloadAsync`.
4. If status is non-200, throw.
5. Success: Trigger Snackbar toast (`success`) with light haptic feedback and immediately invoke `Updates.reloadAsync()` to refresh local Drizzle client database handles.