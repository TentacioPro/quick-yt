/**
 * audit.ts
 * Audit log insertion wrapper for Quick_yt.
 * 100% line + branch coverage required (Task 02 spec).
 *
 * Every significant operation in the app calls logAction() to record:
 *   - What happened (action)
 *   - Which entity it affected (entityId — nullable)
 *   - How long it took (performanceMs)
 *   - Whether it succeeded or failed (status)
 */

import { getDb } from './client';

/**
 * logAction — inserts one row into audit_logs.
 *
 * @param action       Short uppercase string, e.g. 'SYNC_BACKUP', 'PIPELINE_START'
 * @param entityId     ID of the affected entity (e.g. video id), or null
 * @param performanceMs  Elapsed time in milliseconds for the operation
 * @param status       'success' | 'failed' | any descriptive string
 */
export async function logAction(
  action: string,
  entityId: string | null,
  performanceMs: number,
  status: string
): Promise<void> {
  const id = generateId();
  const timestamp = Date.now();
  const db = getDb();

  await db.runAsync(
    `INSERT INTO audit_logs (id, action, entity_id, performance_ms, timestamp, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, action, entityId, performanceMs, timestamp, status]
  );
}

/**
 * generateId — produces a compact unique string ID.
 * Uses Math.random for simplicity; crypto.randomUUID() can replace this
 * once RN's Hermes engine exposes it without polyfill (tracked in Task 02 decisions).
 */
function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}
