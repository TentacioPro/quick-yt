import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { getDrizzleDb } from '../../src/db/client';

// Mock Expo TaskManager & BackgroundFetch
jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-background-fetch', () => ({
  registerBackgroundTaskAsync: jest.fn().mockResolvedValue(undefined),
  BackgroundFetchResult: {
    NewData: 'newData',
    NoData: 'noData',
    Failed: 'failed',
  },
}));

const mockUpdate = jest.fn();
const mockSet = jest.fn();
const mockWhere = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.mock('../../src/db/client', () => {
  const actual = jest.requireActual('../../src/db/client');
  return {
    ...actual,
    getDrizzleDb: () => ({
      update: mockUpdate,
      select: mockSelect,
    }),
  };
});

describe('BackgroundSyncTask', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.spyOn(global, 'fetch');

    // Default DB mock chaining
    mockUpdate.mockReturnValue({
      set: mockSet.mockReturnValue({
        where: mockWhere.mockResolvedValue({}),
      }),
    });
  });

  afterEach(() => {
    mockFetch.mockRestore();
    // Reset module registry cache between tests to allow dynamic re-loading
    jest.resetModules();
  });

  it('defines the task correctly on module load', () => {
    // Dynamic import to capture the defineTask call before clearAllMocks resets it
    const { BACKGROUND_SYNC_TASK } = require('../../src/sync/BackgroundSyncTask');

    expect(TaskManager.defineTask).toHaveBeenCalledWith(
      BACKGROUND_SYNC_TASK,
      expect.any(Function)
    );
  });

  it('executes sync successfully when there are unsynced logs and server is online', async () => {
    const { executeBackgroundSync } = require('../../src/sync/BackgroundSyncTask');
    const mockLogs = [
      { id: 'log-1', action: 'TEST_SYNC', performanceMs: 120, timestamp: 11111, status: 'success', synced: 0 },
    ];

    // Mock select query to return unsynced logs
    mockSelect.mockReturnValue({
      from: mockFrom.mockReturnValue({
        where: jest.fn().mockResolvedValue(mockLogs),
      }),
    });

    // Mock server status (200) and metrics endpoint (200)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as any) // status endpoint
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as any); // metrics endpoint

    const result = await executeBackgroundSync();

    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NewData);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Assert database was updated to mark synced
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith({ synced: 1 });
  });

  it('does nothing and returns NoData when there are no unsynced logs', async () => {
    const { executeBackgroundSync } = require('../../src/sync/BackgroundSyncTask');
    mockSelect.mockReturnValue({
      from: mockFrom.mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await executeBackgroundSync();

    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.NoData);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns Failed and does not mark synced if sync-server is offline', async () => {
    const { executeBackgroundSync } = require('../../src/sync/BackgroundSyncTask');
    const mockLogs = [{ id: 'log-1', action: 'TEST', timestamp: 111, synced: 0 }];

    mockSelect.mockReturnValue({
      from: mockFrom.mockReturnValue({
        where: jest.fn().mockResolvedValue(mockLogs),
      }),
    });

    // Server offline / 500
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as any);

    const result = await executeBackgroundSync();

    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.Failed);
    expect(mockFetch).toHaveBeenCalledTimes(1); // checked status only
    expect(mockUpdate).not.toHaveBeenCalled(); // logs remained unsynced
  });

  it('returns Failed if metrics submission endpoint fails', async () => {
    const { executeBackgroundSync } = require('../../src/sync/BackgroundSyncTask');
    const mockLogs = [{ id: 'log-1', action: 'TEST', timestamp: 111, synced: 0 }];

    mockSelect.mockReturnValue({
      from: mockFrom.mockReturnValue({
        where: jest.fn().mockResolvedValue(mockLogs),
      }),
    });

    // Server status online, metrics endpoint fails
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as any)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Validation error'),
      } as any);

    const result = await executeBackgroundSync();

    expect(result).toBe(BackgroundFetch.BackgroundFetchResult.Failed);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
