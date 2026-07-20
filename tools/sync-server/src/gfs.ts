import * as fs from 'fs';
import * as path from 'path';

/**
 * gfsRotate — Implements the Grandfather-Father-Son (GFS) retention rotation strategy.
 * Scans the snapshots directory and unlinks files that do not match the keepers list.
 *
 * Sons: 7 daily backups (0 - 6 days ago)
 * Fathers: 4 weekly backups (one per week, for weeks 1 - 4 ago)
 * Grandfathers: 12 monthly backups (one per month, for months 1 - 12 ago)
 */
export function gfsRotate(snapshotsDir: string, today: Date = new Date()): void {
  if (!fs.existsSync(snapshotsDir)) {
    return;
  }

  const files = fs.readdirSync(snapshotsDir);
  const snapshotPattern = /^backup_(\d{4}-\d{2}-\d{2})\.db$/;

  // Filter and parse files with valid dates
  const snapshots = files
    .map((file) => {
      const match = file.match(snapshotPattern);
      if (!match) return null;

      const dateStr = match[1];
      const parts = dateStr.split('-');
      const fileDate = new Date(
        Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0)
      );

      return {
        filename: file,
        dateStr,
        date: fileDate,
      };
    })
    .filter((snap): snap is { filename: string; dateStr: string; date: Date } => snap !== null);

  // Normalize today's date to noon UTC for date-only math
  const todayNoon = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12, 0, 0)
  );

  // Helper to get Sunday of a given date (noon UTC)
  const getSundayNoon = (d: Date): Date => {
    const temp = new Date(d);
    const day = temp.getUTCDay();
    temp.setUTCDate(temp.getUTCDate() - day);
    return temp;
  };

  const todaySunday = getSundayNoon(todayNoon);
  const msInDay = 1000 * 60 * 60 * 24;
  const msInWeek = msInDay * 7;

  // Keepers set
  const keepers = new Set<string>();

  // 1. Son: Daily backups (last 7 days, including today: days 0 to 6 ago)
  const dailySnapshots = snapshots.filter((snap) => {
    const diffDays = Math.round((todayNoon.getTime() - snap.date.getTime()) / msInDay);
    return diffDays >= 0 && diffDays < 7;
  });
  dailySnapshots.forEach((s) => keepers.add(s.filename));

  // 2. Father: Weekly backups (weeks 1 to 4 ago)
  // Group snapshots by week index based on age in days
  const weeklyGroups: { [weekIdx: number]: typeof snapshots } = {};
  snapshots.forEach((snap) => {
    const diffDays = Math.round((todayNoon.getTime() - snap.date.getTime()) / msInDay);
    const weekIdx = Math.floor(diffDays / 7);

    if (weekIdx >= 1 && weekIdx <= 4) {
      if (!weeklyGroups[weekIdx]) {
        weeklyGroups[weekIdx] = [];
      }
      weeklyGroups[weekIdx].push(snap);
    }
  });

  // Keep the latest snapshot from each week group
  Object.keys(weeklyGroups).forEach((weekKey) => {
    const group = weeklyGroups[parseInt(weekKey)];
    // Sort descending by date (latest first)
    group.sort((a, b) => b.date.getTime() - a.date.getTime());
    keepers.add(group[0].filename);
  });

  // 3. Grandfather: Monthly backups (months 1 to 12 ago)
  // Group snapshots by calendar month
  const monthlyGroups: { [monthStr: string]: typeof snapshots } = {};
  snapshots.forEach((snap) => {
    const year = snap.date.getUTCFullYear();
    const month = snap.date.getUTCMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    const diffMonths =
      (todayNoon.getUTCFullYear() - snap.date.getUTCFullYear()) * 12 +
      (todayNoon.getUTCMonth() - snap.date.getUTCMonth());

    if (diffMonths >= 1 && diffMonths <= 12) {
      if (!monthlyGroups[monthStr]) {
        monthlyGroups[monthStr] = [];
      }
      monthlyGroups[monthStr].push(snap);
    }
  });

  // Keep the latest snapshot from each month group
  Object.keys(monthlyGroups).forEach((monthStr) => {
    const group = monthlyGroups[monthStr];
    // Sort descending by date
    group.sort((a, b) => b.date.getTime() - a.date.getTime());
    keepers.add(group[0].filename);
  });

  // Prune any backups not in keepers
  snapshots.forEach((snap) => {
    if (!keepers.has(snap.filename)) {
      try {
        fs.unlinkSync(path.join(snapshotsDir, snap.filename));
      } catch (err) {
        // Log/ignore errors on unlink
      }
    }
  });
}
