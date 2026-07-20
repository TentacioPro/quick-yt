import { backupToPC, restoreFromPC } from '../../src/sync/DevSyncManager';
import * as FileSystem from 'expo-file-system';
import { useToastStore } from '../../src/store/useToastStore';
import http from 'http';

// Helper to check status via native node http (bypassing fetch mocks)
function checkStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:4100/api/sync/status', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
}

// Mock expo-file-system to execute REAL network calls to the Express server via node http
jest.mock('expo-file-system', () => {
  const http = require('http');
  return {
    documentDirectory: 'file://mock/directory/',
    FileSystemUploadType: {
      MULTIPART: 'multipart',
    },
    uploadAsync: jest.fn().mockImplementation((url: string) => {
      return new Promise((resolve) => {
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const postData = 
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="database"; filename="app.db"\r\n` +
          `Content-Type: application/octet-stream\r\n\r\n` +
          `SQLite format 3\0\r\n` +
          `--${boundary}--\r\n`;

        const parsedUrl = new URL(url.replace('192.168.1.100', '127.0.0.1'));
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname,
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(postData),
          }
        };

        const req = http.request(options, (res: any) => {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk: string) => body += chunk);
          res.on('end', () => resolve({ status: res.statusCode || 500, body }));
        });

        req.on('error', (err: Error) => {
          resolve({ status: 500, body: err.message });
        });

        req.write(postData);
        req.end();
      });
    }),
    downloadAsync: jest.fn().mockImplementation((url: string) => {
      return new Promise((resolve) => {
        const parsedUrl = new URL(url.replace('192.168.1.100', '127.0.0.1'));
        const req = http.get({
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname,
        }, (res: any) => {
          resolve({ status: res.statusCode || 500 });
        });
        req.on('error', () => {
          resolve({ status: 500 });
        });
        req.end();
      });
    }),
    getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
    makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock('expo-updates', () => ({
  reloadAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/db/audit', () => ({
  logAction: jest.fn().mockResolvedValue(undefined),
}));

describe('DevSyncManager Real-World Integration Hardening', () => {
  let mockToastShow: jest.SpyInstance;

  beforeEach(() => {
    mockToastShow = jest.spyOn(useToastStore.getState(), 'show').mockImplementation(() => {});
  });

  afterEach(() => {
    mockToastShow.mockRestore();
  });

  it('runs E2E backup and restore against running local sync server', async () => {
    const isServerRunning = await checkStatus();

    if (!isServerRunning) {
      console.warn('Skipping E2E Integration test: Sync Server is not running on port 4100.');
      return;
    }

    // 1. Run Backup
    await backupToPC();
    expect(mockToastShow).toHaveBeenCalledWith('Backup complete', 'success');

    // 2. Run Restore
    await restoreFromPC();
    expect(mockToastShow).toHaveBeenLastCalledWith('Restore complete', 'success');
  });
});
