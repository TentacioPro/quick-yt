# 09-gfs-backups — Decisions

## Decision Log

### D-01 · Age-in-Days Week Binning over Calendar Sunday Offsets
- **Context:** Implementing weekly GFS slots via Sunday calendar groupings (e.g., getting Sunday dates) depends heavily on calendar boundaries and is sensitive to the current day of the week. This regularly causes files in the same weekly bin to get misclassified or pruned unexpectedly depending on Sunday-to-Saturday overlaps.
- **Decision:** Classified weekly bins by direct age offset:
  `weekIdx = Math.floor(diffDays / 7)`
  This maps Week 1 to days 7-13, Week 2 to days 14-20, etc. This is calendar-independent, mathematically clean, and aligns perfectly with backup date intervals.

---

### D-02 · Failure Isolation on Snapshot Copy/Rotation
- **Context:** The GFS rotation copies databases and deletes files. If an I/O error occurs (e.g., directory permission check or lock issue during copy/unlink), it should not fail the primary upload HTTP response.
- **Decision:** Wrapped the GFS copy and rotation triggers inside a try/catch block within `POST /api/sync/backup`. On error, it logs a console warning but still returns a `200 OK` success response to the client.

---

## Terminal Evidence

```
# Sync Server tests
PASS __tests__/gfs.test.ts
  GFS Backup Rotation
    √ retains all daily files from the last 7 days (8 ms)
    √ retains exactly one backup per week for the last 4 weeks (3 ms)
    √ retains exactly one backup per month for the last 12 months (4 ms)
    √ handles malformed filenames or empty directories gracefully (2 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        1.796 s, estimated 2 s
Ran all test suites matching /gfs/i.
```
