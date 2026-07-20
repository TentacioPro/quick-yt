# Living Specification — Error Contract

> Last updated by: Task 02 — Drizzle Schemas + withAuditCatch + Jest TDD Harness
> Driven by: `specs/tasks/02-drizzle-schemas-tdd.md`, plan.md v2 amendments

---

## 1. Mobile-Side Error Contract

All async operations on the mobile app **must** be wrapped with `withAuditCatch()`.

### `withAuditCatch` Guarantee

| Path | Audit Log Written | Error Propagated |
|---|---|---|
| `fn()` resolves | `status: 'success'`, measured `performanceMs` | No — result returned normally |
| `fn()` throws | `status: 'failed'`, measured `performanceMs` | Yes — original error re-thrown |

**No operation may silently swallow errors.** Every caught error must be surfaced either:
1. Via `withAuditCatch` → audit log → UI layer re-throw, OR
2. Via direct `useToastStore.getState().show(message, 'error')` for non-audited catches.

### Audit Log `status` Values

| Value | Meaning |
|---|---|
| `'success'` | Operation completed without throwing |
| `'failed'` | Operation threw an error (message captured via `withAuditCatch`) |
| Custom string | Allowed for future structured states (e.g. `'cancelled'`, `'skipped'`) |

---

## 2. Server-Side Error Contract (`tools/sync-server`)

> Implemented in Task 05. Defined here for cross-system consistency.

All Express endpoints must return responses conforming to one of:

```typescript
// Success response
interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

// Error response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;   // Uppercase snake_case, e.g. 'BACKUP_NOT_FOUND'
    message: string; // Human-readable explanation
  };
}
```

### Canonical Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `INVALID_FILE_TYPE` | 400 | Uploaded file is not a `.db` SQLite file |
| `NO_FILE_UPLOADED` | 400 | Multipart request missing `database` field |
| `BACKUP_NOT_FOUND` | 404 | No backup `.db` exists on server for restore |
| `UPLOAD_FAILED` | 500 | Server-side write error during backup |
| `INTERNAL_ERROR` | 500 | Unhandled/unexpected server error |

### Rule: No naked `res.send()` or `res.json()` with ad-hoc shapes

Every `res.json()` call must pass an `ApiSuccessResponse` or `ApiErrorResponse` object. Type assertions enforced via TypeScript at compile time in Task 05.

---

## 3. Cross-System Rule

If the mobile app receives an `ApiErrorResponse` from the sync server (i.e. `body.success === false`), it must:

1. Log the error to `audit_logs` via `logAction(action, entityId, performanceMs, 'failed')`.
2. Show a user-facing error toast via `useToastStore.getState().show(body.error.message, 'error')`.
3. Never silently continue processing.