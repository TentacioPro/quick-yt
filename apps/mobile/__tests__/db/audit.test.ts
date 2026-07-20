/**
 * TDD — RED STEP
 * audit.test.ts
 * Task 02: Asserts logAction() inserts the correct payload into audit_logs.
 * 100% line + branch coverage required per spec.
 * Must FAIL on empty/missing implementation.
 */

import { logAction } from '../../src/db/audit';
import { getDb } from '../../src/db/client';

// expo-sqlite is mocked in jest.setup.js
// We need to grab the mock runAsync to assert call args
jest.mock('../../src/db/client');

const mockRunAsync = jest.fn().mockResolvedValue(undefined);
const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

beforeEach(() => {
  jest.clearAllMocks();
  mockRunAsync.mockResolvedValue(undefined);
  mockGetDb.mockReturnValue({
    runAsync: mockRunAsync,
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
  } as any);
});

describe('logAction()', () => {
  it('① calls db.runAsync with an INSERT SQL statement', async () => {
    await logAction('TEST_ACTION', 'entity-123', 50, 'success');
    expect(mockRunAsync).toHaveBeenCalledTimes(1);
    const [sql] = mockRunAsync.mock.calls[0];
    expect(sql.toLowerCase()).toContain('insert');
    expect(sql.toLowerCase()).toContain('audit_logs');
  });

  it('② inserted row contains all required fields', async () => {
    await logAction('SYNC_BACKUP', 'video-abc', 120, 'success');
    const [, params] = mockRunAsync.mock.calls[0];
    // params is the array of bound values [id, action, entityId, performanceMs, timestamp, status]
    expect(params).toEqual(
      expect.arrayContaining(['SYNC_BACKUP', 'video-abc', 120, 'success'])
    );
  });

  it('③ id is auto-generated as a non-empty string', async () => {
    await logAction('PIPELINE_START', null, 0, 'success');
    const [, params] = mockRunAsync.mock.calls[0];
    const id = params[0];
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('④ timestamp is auto-generated as a positive integer close to Date.now()', async () => {
    const before = Date.now();
    await logAction('PIPELINE_END', null, 200, 'success');
    const after = Date.now();
    const [, params] = mockRunAsync.mock.calls[0];
    // timestamp is the 5th bound value [id, action, entityId, performanceMs, timestamp, status]
    const timestamp = params[4];
    expect(typeof timestamp).toBe('number');
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it('⑤ accepts null entityId without throwing', async () => {
    await expect(logAction('ACTION', null, 0, 'failed')).resolves.not.toThrow();
    const [, params] = mockRunAsync.mock.calls[0];
    expect(params).toContain(null);
  });
});
