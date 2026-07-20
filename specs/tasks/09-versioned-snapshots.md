# 09 — Versioned Snapshots (GFS Rotation)

## GOAL
Implement a Grandfather-Father-Son (GFS) backup retention rotation algorithm on the Express sync-server (`tools/sync-server`). Every time a new SQLite database is uploaded via `POST /api/sync/backup`, the server must:
1. Save a timestamped copy of the database to `.dev-backups/snapshots/backup_YYYY-MM-DD.db`.
2. Run the GFS pruning routine to scan the directory and delete older backups, keeping only:
   - **Son:** Daily backups for the last 7 days.
   - **Father:** Weekly backups (one per week) for the last 4 weeks.
   - **Grandfather:** Monthly backups (one per calendar month) for the last 12 months.

## MODULE SPECS IN SCOPE
- `specs/modules/sync-protocol.spec.md` — Paths and snapshot storage settings.
- `specs/modules/gfs-retention.spec.md` — GFS date categorization and pruning rules.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Express POST /api/sync/backup | `tools/sync-server/src/index.ts` | Trigger the snapshot copy and GFS pruning on successful upload. |

## FILE SCOPE
Only the following files may be created or modified:

```text
tools/sync-server/src/gfs.ts                       (create)
tools/sync-server/src/index.ts                     (modify — call gfs trigger on backup)
tools/sync-server/__tests__/gfs.test.ts            (create)
specs/modules/gfs-retention.spec.md                (create)
specs/tasks/09-versioned-snapshots-decisions.md    (create)
specs/tasks/09-versioned-snapshots.state.md        (update)
```

## TDD CONTRACT

### 1. New Test Suites

#### `tools/sync-server/__tests__/gfs.test.ts`
- Assert `gfsRotate` correctly categorizes mock snapshot file lists spanning a 1-year timeline.
- Assert daily retention: retains all 7 backups from the last 7 days.
- Assert weekly retention: retains exactly 4 weekly backups (one per week) from the last 4 weeks.
- Assert monthly retention: retains exactly 12 monthly backups (one per month) from the last 12 months.
- Assert prune: deletes files that fall outside the active GFS retention categories.
- Assert edge cases: handles missing dates in filenames, handles duplicate dates, and behaves gracefully on empty directories.

### 2. Regression Assertions
- All prior workspace tests must remain green.

## OUT OF SCOPE
- No cloud backups or off-site synchronization.
- No zip compression of database snapshots.

## DONE MEANS
- [ ] GFS rotation tests pass green.
- [ ] All prior tests remain green.
- [ ] `09-versioned-snapshots-decisions.md` written.
- [ ] `specs/modules/gfs-retention.spec.md` created.
- [ ] Terminal test logs appended to state tracker.
