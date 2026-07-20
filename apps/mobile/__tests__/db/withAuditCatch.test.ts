/**
 * TDD — RED STEP
 * withAuditCatch.test.ts
 * Task 02: Asserts the withAuditCatch HOF logs success/failure to audit_logs
 * and correctly propagates return values and thrown errors.
 * 100% line + branch coverage required per spec.
 * Must FAIL on empty/missing implementation.
 */

import { withAuditCatch } from '../../src/db/withAuditCatch';
import { logAction } from '../../src/db/audit';

jest.mock('../../src/db/audit');

const mockLogAction = logAction as jest.MockedFunction<typeof logAction>;

beforeEach(() => {
  jest.clearAllMocks();
  mockLogAction.mockResolvedValue(undefined);
});

describe('withAuditCatch()', () => {
  it('① successful fn() logs status:"success" with performanceMs > 0', async () => {
    await withAuditCatch('TEST_ACTION', 'entity-1', async () => 'result');

    expect(mockLogAction).toHaveBeenCalledTimes(1);
    const [action, entityId, performanceMs, status] = mockLogAction.mock.calls[0];
    expect(action).toBe('TEST_ACTION');
    expect(entityId).toBe('entity-1');
    expect(typeof performanceMs).toBe('number');
    expect(performanceMs).toBeGreaterThanOrEqual(0);
    expect(status).toBe('success');
  });

  it('② returns the resolved value of fn()', async () => {
    const result = await withAuditCatch('ACTION', 'id', async () => 42);
    expect(result).toBe(42);
  });

  it('③ throwing fn() logs status:"failed" and re-throws the original error', async () => {
    const originalError = new Error('network timeout');
    const failingFn = async () => {
      throw originalError;
    };

    await expect(
      withAuditCatch('SYNC_BACKUP', 'video-xyz', failingFn)
    ).rejects.toThrow('network timeout');

    expect(mockLogAction).toHaveBeenCalledTimes(1);
    const [action, , , status] = mockLogAction.mock.calls[0];
    expect(action).toBe('SYNC_BACKUP');
    expect(status).toBe('failed');
  });

  it('④ null entityId is handled without error on success', async () => {
    await expect(
      withAuditCatch('ACTION', null, async () => undefined)
    ).resolves.not.toThrow();

    const [, entityId] = mockLogAction.mock.calls[0];
    expect(entityId).toBeNull();
  });

  it('⑤ null entityId is handled without error on failure', async () => {
    await expect(
      withAuditCatch('ACTION', null, async () => {
        throw new Error('fail');
      })
    ).rejects.toThrow('fail');

    const [, entityId, , status] = mockLogAction.mock.calls[0];
    expect(entityId).toBeNull();
    expect(status).toBe('failed');
  });
});
