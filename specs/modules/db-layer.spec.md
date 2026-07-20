# Living Specification — DB Layer

> Last updated by: Task 02 — Drizzle Schemas + withAuditCatch + Jest TDD Harness
> Driven by: `specs/tasks/02-drizzle-schemas-tdd.md`
> Source truth: `02_Architecture_and_TDD.md`

---

## 1. Database File

- **Engine:** `expo-sqlite` via `SQLite.openDatabaseSync('app.db')`
- **ORM:** `drizzle-orm/expo-sqlite`
- **File location on device:** `${FileSystem.documentDirectory}SQLite/app.db`
- **Singleton pattern:** `getDb()` in `client.ts` — single `SQLiteDatabase` handle per app session.

---

## 2. Schema Tables

### `videos`
```typescript
sqliteTable('videos', {
  id:              text('id').primaryKey(),           // UUID/random string
  url:             text('url').notNull(),              // Full YouTube URL
  title:           text('title'),                     // Nullable — filled post-fetch
  timestampAdded:  integer('timestamp_added').notNull(), // Date.now() at insert
  transcriptRaw:   text('transcript_raw'),            // Raw joined transcript text
  markdownReport:  text('markdown_report'),           // Gemini output
  visualReport:    text('visual_report'),             // Gemini Vision output
  status:          text('status').default('pending'), // Lifecycle state (see below)
})
```

**Video Status Lifecycle:**
```
pending → transcribing → processing → generating_pdf → complete
                                                     ↘ failed (any stage)
```

### `audit_logs`
```typescript
sqliteTable('audit_logs', {
  id:            text('id').primaryKey(),      // Auto-generated random string
  action:        text('action').notNull(),     // Uppercase label, e.g. 'SYNC_BACKUP'
  entityId:      text('entity_id'),           // Nullable — video id or null
  performanceMs: integer('performance_ms'),   // Wall-clock duration
  timestamp:     integer('timestamp').notNull(), // Date.now() at log time
  status:        text('status'),              // 'success' | 'failed'
  synced:        integer('synced').default(0), // 0 = unsynced, 1 = synced
})
```

---

## 3. Client API (`src/db/client.ts`)

| Export | Signature | Purpose |
|---|---|---|
| `getDb()` | `() => SQLiteDatabase` | Raw expo-sqlite handle for audit writes |
| `getDrizzleDb()` | `() => DrizzleDb` | Typed Drizzle client for feature queries |
| `initDatabase()` | `() => Promise<void>` | Runs CREATE TABLE IF NOT EXISTS on startup |
| `resetDb()` | `() => void` | **Test-only** — clears singletons |

---

## 4. Audit Layer (`src/db/audit.ts`)

```typescript
logAction(
  action: string,
  entityId: string | null,
  performanceMs: number,
  status: string
): Promise<void>
```

- **100% line + branch coverage enforced** by Jest `coverageThreshold`.
- Uses raw `db.runAsync()` — no Drizzle ORM overhead.
- `id` generated via `Math.random().toString(36)` × 2 (migration to `crypto.randomUUID()` pending).
- `timestamp` = `Date.now()` at call time.

---

## 5. Error Wrapper (`src/db/withAuditCatch.ts`)

```typescript
withAuditCatch<T>(
  action: string,
  entityId: string | null,
  fn: () => Promise<T>
): Promise<T>
```

- **100% line + branch coverage enforced.**
- Measures wall-clock time via `Date.now()` before/after `fn()`.
- **Success path:** awaits `fn()`, logs `status:'success'`, returns result.
- **Failure path:** catches error, logs `status:'failed'`, re-throws original error.
- Every mobile-side operation (network, file-system, DB mutations) **must** use this wrapper.

---

## 6. Migration Strategy

- No `drizzle-kit` at runtime. Migrations are `CREATE TABLE IF NOT EXISTS` SQL strings run in `initDatabase()`.
- Schema changes require a new numbered task. DDL is append-only (add columns only via `ALTER TABLE ADD COLUMN IF NOT EXISTS`).