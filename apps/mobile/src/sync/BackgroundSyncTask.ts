import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { getDrizzleDb } from '../db/client';
import { auditLogs } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { PC_IP } from './DevSyncManager';

export const BACKGROUND_SYNC_TASK = 'background-metrics-sync';

/**
 * executeBackgroundSync — background job handler.
 * Fetches unsynced logs, checks sync-server online status, submits metrics,
 * and marks them synced in SQLite on success.
 */
export async function executeBackgroundSync(): Promise<BackgroundFetch.BackgroundFetchResult> {
  try {
    const db = getDrizzleDb();

    // 1. Fetch unsynced audit logs
    const unsyncedLogs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.synced, 0));

    if (unsyncedLogs.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // 2. Verify server online status
    let statusCheck: Response;
    try {
      statusCheck = await fetch(`${PC_IP}/api/sync/status`);
    } catch (_) {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    if (!statusCheck.ok) {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // 3. Post metrics to sync-server
    let response: Response;
    try {
      response = await fetch(`${PC_IP}/api/sync/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(unsyncedLogs),
      });
    } catch (_) {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    if (!response.ok) {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // 4. Mark logs as synced in SQLite database
    const logIds = unsyncedLogs.map((log) => log.id);
    await db
      .update(auditLogs)
      .set({ synced: 1 })
      .where(inArray(auditLogs.id, logIds));

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    // Return failed status to expo-task-manager instead of crashing the thread
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
}

// Define the background task in TaskManager
TaskManager.defineTask(BACKGROUND_SYNC_TASK, executeBackgroundSync);
