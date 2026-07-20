/**
 * withAuditCatch.ts
 * Higher-order function that wraps any async operation with audit logging.
 * 100% line + branch coverage required (Task 02 spec).
 *
 * Usage:
 *   const result = await withAuditCatch('SYNC_BACKUP', videoId, () => backupToPC());
 *
 * On success: logs status:'success' with measured performanceMs, returns fn() result.
 * On failure: logs status:'failed', re-throws the original error for the UI layer.
 */

import { logAction } from './audit';

/**
 * withAuditCatch — wraps an async function with audit logging on both success and failure.
 *
 * @param action     Audit log action label (uppercase, e.g. 'SYNC_BACKUP')
 * @param entityId   ID of the affected entity, or null
 * @param fn         The async operation to execute and audit
 * @returns          The resolved value of fn()
 * @throws           Re-throws any error from fn() after logging it
 */
export async function withAuditCatch<T>(
  action: string,
  entityId: string | null,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  try {
    const result = await fn();
    const performanceMs = Date.now() - start;
    await logAction(action, entityId, performanceMs, 'success');
    return result;
  } catch (error) {
    const performanceMs = Date.now() - start;
    await logAction(action, entityId, performanceMs, 'failed');
    throw error;
  }
}
