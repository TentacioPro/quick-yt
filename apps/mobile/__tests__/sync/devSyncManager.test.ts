import { backupToPC, restoreFromPC, PC_IP } from '../../src/sync/DevSyncManager';
import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import { useToastStore } from '../../src/store/useToastStore';

// Override the global mock locally for expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://mock/directory/',
  uploadAsync: jest.fn(),
  downloadAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  FileSystemUploadType: {
    MULTIPART: 'multipart',
  },
}));

jest.mock('../../src/db/audit');

describe('DevSyncManager', () => {
  let mockToastShow: jest.SpyInstance;
  let mockUploadAsync: jest.Mock;
  let mockDownloadAsync: jest.Mock;
  let mockGetInfoAsync: jest.Mock;
  let mockMakeDirectoryAsync: jest.Mock;
  let mockReloadAsync: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToastShow = jest.spyOn(useToastStore.getState(), 'show').mockImplementation(() => {});
    mockUploadAsync = FileSystem.uploadAsync as jest.Mock;
    mockDownloadAsync = FileSystem.downloadAsync as jest.Mock;
    mockGetInfoAsync = FileSystem.getInfoAsync as jest.Mock;
    mockMakeDirectoryAsync = FileSystem.makeDirectoryAsync as jest.Mock;
    mockReloadAsync = Updates.reloadAsync as jest.Mock;

    mockUploadAsync.mockResolvedValue({
      status: 200,
      body: JSON.stringify({ success: true }),
    });

    mockDownloadAsync.mockResolvedValue({
      status: 200,
    });

    mockGetInfoAsync.mockResolvedValue({
      exists: true,
    });

    mockMakeDirectoryAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    mockToastShow.mockRestore();
  });

  it('backupToPC() — successfully uploads database and triggers success toast', async () => {
    await backupToPC();

    expect(mockUploadAsync).toHaveBeenCalledTimes(1);
    const [url, fileUri, options] = mockUploadAsync.mock.calls[0];
    expect(url).toBe(`${PC_IP}/api/sync/backup`);
    expect(fileUri).toContain('SQLite/app.db');
    expect(options.httpMethod).toBe('POST');
    expect(options.uploadType).toBe(FileSystem.FileSystemUploadType.MULTIPART);
    expect(options.fieldName).toBe('database');

    expect(mockToastShow).toHaveBeenCalledWith('Backup complete', 'success');
  });

  it('backupToPC() — fails when source file does not exist', async () => {
    mockGetInfoAsync.mockResolvedValueOnce({ exists: false });

    await expect(backupToPC()).rejects.toThrow('Local database file does not exist');
    expect(mockUploadAsync).not.toHaveBeenCalled();
    expect(mockToastShow).toHaveBeenCalledWith(
      expect.stringContaining('Local database file does not exist'),
      'error'
    );
  });

  it('backupToPC() — triggers error toast and logs failure when upload rejects', async () => {
    mockUploadAsync.mockRejectedValueOnce(new Error('Connection timed out'));

    await expect(backupToPC()).rejects.toThrow('Connection timed out');
    expect(mockToastShow).toHaveBeenCalledWith(expect.stringContaining('Connection timed out'), 'error');
  });

  it('backupToPC() — triggers error toast and logs failure when upload returns non-200 status', async () => {
    mockUploadAsync.mockResolvedValueOnce({
      status: 400,
      body: JSON.stringify({
        success: false,
        error: { code: 'INVALID_FILE_TYPE', message: 'Rejected by schema' },
      }),
    });

    await expect(backupToPC()).rejects.toThrow('Database backup failed: Rejected by schema');
    expect(mockToastShow).toHaveBeenCalledWith(
      'Sync failed: Database backup failed: Rejected by schema',
      'error'
    );
  });

  it('restoreFromPC() — successfully downloads database, triggers success toast, and reloads', async () => {
    await restoreFromPC();

    expect(mockMakeDirectoryAsync).toHaveBeenCalledTimes(1);
    expect(mockDownloadAsync).toHaveBeenCalledTimes(1);
    const [url, fileUri] = mockDownloadAsync.mock.calls[0];
    expect(url).toBe(`${PC_IP}/api/sync/restore`);
    expect(fileUri).toContain('SQLite/app.db');

    expect(mockToastShow).toHaveBeenCalledWith('Restore complete', 'success');
    expect(mockReloadAsync).toHaveBeenCalledTimes(1);
  });

  it('restoreFromPC() — triggers error toast and logs failure when download rejects', async () => {
    mockDownloadAsync.mockRejectedValueOnce(new Error('Server offline'));

    await expect(restoreFromPC()).rejects.toThrow('Server offline');
    expect(mockToastShow).toHaveBeenCalledWith(expect.stringContaining('Server offline'), 'error');
    expect(mockReloadAsync).not.toHaveBeenCalled();
  });

  it('restoreFromPC() — triggers error toast and logs failure when download returns non-200 status', async () => {
    mockDownloadAsync.mockResolvedValueOnce({
      status: 404,
      body: JSON.stringify({
        success: false,
        error: { code: 'BACKUP_NOT_FOUND', message: 'No backup file exists' },
      }),
    });

    await expect(restoreFromPC()).rejects.toThrow('Database restore failed with status 404');
    expect(mockToastShow).toHaveBeenCalledWith(
      'Sync failed: Database restore failed with status 404',
      'error'
    );
    expect(mockReloadAsync).not.toHaveBeenCalled();
  });
});
