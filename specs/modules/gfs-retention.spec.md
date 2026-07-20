# Living Specification — GFS Retention Rotation Strategy

> Last updated by: Task 09 — Automated Versioned Snapshots (GFS Rotation)
> Driven by: `specs/tasks/09-gfs-backups.md`

On the Express sync-server (`tools/sync-server`), every upload triggers a versioned database copy saved into the snapshots folder:
`.dev-backups/snapshots/backup_YYYY-MM-DD.db`

To prevent the disk from filling up, the server runs a Grandfather-Father-Son (GFS) pruning loop.

---

## 1. GFS Retention Bins

### Daily Backups (Sons)
- **Range:** Age is `0 <= age < 7` days.
- **Rule:** Retain all daily backups in this range.
- **Goal:** Allow quick rollbacks during active development.

### Weekly Backups (Fathers)
- **Range:** Age in weeks is `1 <= weekIdx <= 4` (calculated as `Math.floor(age / 7)`).
- **Rule:** Retain exactly **one** backup per weekly bin (the newest/latest snapshot date).
- **Goal:** Keep historical logs spanning the last 4 weeks.

### Monthly Backups (Grandfathers)
- **Range:** Age in months is `1 <= monthIdx <= 12` (calculated as year and month difference).
- **Rule:** Retain exactly **one** backup per calendar month bin (the newest/latest snapshot date).
- **Goal:** Preserve monthly database histories for long-term audit reporting.

---

## 2. Pruning Routine

1. Reads directory contents of `.dev-backups/snapshots/`.
2. Filters out files not matching the pattern `backup_YYYY-MM-DD.db` or with invalid dates.
3. Calculates age in days relative to `today` using UTC noon normalization.
4. Categorizes snapshots into the three retention bins (Daily, Weekly 1–4, Monthly 1–12).
5. Aggregates all keeper filenames into a Set.
6. Unlinks (deletes) any matching snapshot file that is not present in the keepers Set.
