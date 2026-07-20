/// <reference types="jest" />
import request from 'supertest';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs', () => {
  const original = jest.requireActual('fs');
  return {
    ...original,
    renameSync: jest.fn().mockImplementation((src: string, dest: string) => {
      if ((global as any).shouldMockRenameThrow) {
        throw new Error('Rename disk permission error');
      }
      return original.renameSync(src, dest);
    }),
    writeFileSync: jest.fn().mockImplementation((p: any, data: any, options: any) => {
      if ((global as any).shouldMockWriteFileSyncThrow && p.includes('metrics_log.json')) {
        throw new Error('Write metrics disk error');
      }
      return original.writeFileSync(p, data, options);
    }),
    copyFileSync: jest.fn().mockImplementation((src: string, dest: string) => {
      if ((global as any).shouldMockCopyFileSyncThrow) {
        throw new Error('Copy file error');
      }
      return original.copyFileSync(src, dest);
    }),
  };
});

const BACKUP_DIR = path.join(__dirname, '../.dev-backups');
const BACKUP_FILE = path.join(BACKUP_DIR, 'app_backup.db');

describe('Sync Server Endpoints', () => {
  let app: any;
  let mcpApp: any;

  beforeAll(() => {
    // Delete backup directory recursively to trigger app startup mkdirSync coverage
    if (fs.existsSync(BACKUP_DIR)) {
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    jest.resetModules();
    const indexModule = require('../src/index');
    app = indexModule.app;
    mcpApp = indexModule.mcpApp;

    // Delete snapshots directory to trigger backup handler snapshots mkdirSync coverage
    const snapshotsDir = path.join(BACKUP_DIR, 'snapshots');
    if (fs.existsSync(snapshotsDir)) {
      fs.rmSync(snapshotsDir, { recursive: true, force: true });
    }

    // Delete backup file if it exists to ensure clean state
    if (fs.existsSync(BACKUP_FILE)) {
      fs.unlinkSync(BACKUP_FILE);
    }
  });

  afterAll(() => {
    // Clean up backup file
    if (fs.existsSync(BACKUP_FILE)) {
      fs.unlinkSync(BACKUP_FILE);
    }
  });

  it('GET /api/sync/status — returns success message', async () => {
    const res = await request(app).get('/api/sync/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Sync server is running.',
    });
  });

  it('POST /api/sync/backup — accepts valid SQLite .db files', async () => {
    // Create temporary mock database buffer
    const mockDbBuffer = Buffer.from('SQLite format 3\0', 'binary');

    const res = await request(app)
      .post('/api/sync/backup')
      .attach('database', mockDbBuffer, {
        filename: 'app_backup.db',
        contentType: 'application/octet-stream',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('backed up');

    // Confirm file was written
    expect(fs.existsSync(BACKUP_FILE)).toBe(true);
  });

  it('POST /api/sync/backup — rejects non-.db files (e.g. .txt extension)', async () => {
    const mockTxtBuffer = Buffer.from('Some plain text', 'utf8');

    const res = await request(app)
      .post('/api/sync/backup')
      .attach('database', mockTxtBuffer, {
        filename: 'app_backup.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
    expect(res.body.error.message).toContain('.db');
  });

  it('POST /api/sync/backup — rejects when no file is uploaded', async () => {
    const res = await request(app).post('/api/sync/backup');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NO_FILE_UPLOADED');
  });

  it('GET /api/sync/restore — serves the backed up database file', async () => {
    // Write a mock database first
    const mockDbBuffer = Buffer.from('SQLite format 3\0', 'binary');
    fs.writeFileSync(BACKUP_FILE, mockDbBuffer);

    const res = await request(app).get('/api/sync/restore');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/octet-stream');
    expect(res.body).toEqual(mockDbBuffer);
  });

  it('GET /api/sync/restore — returns 404 error when backup is missing', async () => {
    const res = await request(app).get('/api/sync/restore');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BACKUP_NOT_FOUND');
  });

  describe('POST /api/sync/metrics', () => {
    const METRICS_FILE = path.join(BACKUP_DIR, 'metrics_log.json');

    beforeEach(() => {
      if (fs.existsSync(METRICS_FILE)) {
        fs.unlinkSync(METRICS_FILE);
      }
    });

    afterAll(() => {
      if (fs.existsSync(METRICS_FILE)) {
        fs.unlinkSync(METRICS_FILE);
      }
    });

    it('accepts and appends valid audit log payloads', async () => {
      const mockMetrics = [
        {
          id: 'log-1',
          action: 'SYNC_BACKUP',
          entityId: null,
          performanceMs: 120,
          timestamp: Date.now(),
          status: 'success',
          synced: 0,
        },
      ];

      const res = await request(app)
        .post('/api/sync/metrics')
        .send(mockMetrics);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      expect(fs.existsSync(METRICS_FILE)).toBe(true);
      const fileData = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
      expect(fileData.length).toBe(1);
      expect(fileData[0].id).toBe('log-1');
    });

    it('rejects payloads that are not arrays', async () => {
      const invalidPayload = { id: 'log-1', action: 'TEST' };

      const res = await request(app)
        .post('/api/sync/metrics')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects arrays containing invalid audit log items (missing action)', async () => {
      const invalidPayload = [
        {
          id: 'log-1',
          performanceMs: 120,
          timestamp: Date.now(),
        },
      ];

      const res = await request(app)
        .post('/api/sync/metrics')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Response Utility Helpers', () => {
    const { makeSuccessResponse, makeErrorResponse } = require('../src/errors');

    it('makeSuccessResponse — returns success true and packs data/message', () => {
      const res = makeSuccessResponse({ id: 123 }, 'Success payload');
      expect(res.success).toBe(true);
      expect(res.data).toEqual({ id: 123 });
      expect(res.message).toBe('Success payload');
    });

    it('makeErrorResponse — returns success false and packs error code/message', () => {
      const res = makeErrorResponse('TEST_CODE', 'Test message');
      expect(res.success).toBe(false);
      expect(res.error.code).toBe('TEST_CODE');
      expect(res.error.message).toBe('Test message');
    });
  });

  describe('MCP SSE Transport Endpoints', () => {
    it('GET /sse — initiates text/event-stream connection', (done) => {
      const http = require('http');
      const server = mcpApp.listen(0, () => {
        const address = server.address();
        const port = typeof address === 'string' ? 0 : address?.port;
        
        const req = http.get(`http://localhost:${port}/sse`, (res: any) => {
          expect(res.headers['content-type']).toContain('text/event-stream');
          expect(res.statusCode).toBe(200);
          req.destroy();
          server.close(done);
        });
      });
    });

    it('POST /messages — rejects requests when transport is not active', async () => {
      const res = await request(mcpApp)
        .post('/messages')
        .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });

      expect(res.status).toBe(400);
      expect(res.text).toContain('Transport not initialized');
    });

    it('POST /messages — forwards requests when transport is active', async () => {
      const { mcpTransport } = require('../src/index');
      const mockPostMessage = jest.fn().mockImplementation((req, res) => {
        res.status(200).send('mock message processed');
      });

      // Inject mock handler on the transport
      const originalTransport = (require('../src/index') as any).mcpTransport;
      (require('../src/index') as any).mcpTransport = {
        handlePostMessage: mockPostMessage,
      };

      try {
        const res = await request(mcpApp)
          .post('/messages')
          .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });

        expect(res.status).toBe(200);
        expect(res.text).toBe('mock message processed');
        expect(mockPostMessage).toHaveBeenCalled();
      } finally {
        (require('../src/index') as any).mcpTransport = originalTransport;
      }
    });

    it('POST /messages — catches errors inside handlePostMessage and returns 500', async () => {
      const originalTransport = (require('../src/index') as any).mcpTransport;
      (require('../src/index') as any).mcpTransport = {
        handlePostMessage: () => {
          throw new Error('Forced handlePostMessage crash');
        },
      };

      try {
        const res = await request(mcpApp)
          .post('/messages')
          .send({ jsonrpc: '2.0', method: 'tools/list', id: 1 });

        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Forced handlePostMessage crash');
      } finally {
        (require('../src/index') as any).mcpTransport = originalTransport;
      }
    });
  });

  describe('Edge Case Branch Coverages', () => {
    const METRICS_FILE = path.join(BACKUP_DIR, 'metrics_log.json');

    beforeEach(() => {
      if (fs.existsSync(METRICS_FILE)) {
        fs.unlinkSync(METRICS_FILE);
      }
    });

    it('POST /api/sync/metrics — appends to existing valid metrics JSON file', async () => {
      fs.writeFileSync(METRICS_FILE, JSON.stringify([{ id: 'prev-1', action: 'PREV' }]), 'utf8');

      const mockMetrics = [{ id: 'log-1', action: 'NEW', timestamp: Date.now() }];
      const res = await request(app).post('/api/sync/metrics').send(mockMetrics);
      expect(res.status).toBe(200);

      const fileData = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
      expect(fileData.length).toBe(2);
      expect(fileData[0].id).toBe('prev-1');
      expect(fileData[1].id).toBe('log-1');
    });

    it('POST /api/sync/metrics — resets array if existing metrics JSON is malformed', async () => {
      fs.writeFileSync(METRICS_FILE, '{ malformed json ', 'utf8');

      const mockMetrics = [{ id: 'log-1', action: 'NEW', timestamp: Date.now() }];
      const res = await request(app).post('/api/sync/metrics').send(mockMetrics);
      expect(res.status).toBe(200);

      const fileData = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
      expect(fileData.length).toBe(1);
      expect(fileData[0].id).toBe('log-1');
    });

    it('POST /api/sync/metrics — returns 500 when write fails', async () => {
      const mockMetrics = [{ id: 'log-1', action: 'NEW', timestamp: Date.now() }];
      (global as any).shouldMockWriteFileSyncThrow = true;

      try {
        const res = await request(app).post('/api/sync/metrics').send(mockMetrics);
        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_ERROR');
      } finally {
        (global as any).shouldMockWriteFileSyncThrow = false;
      }
    });

    it('POST /api/sync/backup — unlinks existing backup file before writing new one', async () => {
      fs.writeFileSync(BACKUP_FILE, 'existing data');
      const mockDbBuffer = Buffer.from('SQLite format 3\0', 'binary');

      const res = await request(app)
        .post('/api/sync/backup')
        .attach('database', mockDbBuffer, {
          filename: 'app_backup.db',
          contentType: 'application/octet-stream',
        });

      expect(res.status).toBe(200);
      expect(fs.readFileSync(BACKUP_FILE).toString()).toContain('SQLite');
    });

    it('POST /api/sync/backup — unlinks temp upload file and returns 500 on rename failures', async () => {
      const mockDbBuffer = Buffer.from('SQLite format 3\0', 'binary');
      (global as any).shouldMockRenameThrow = true;

      try {
        const res = await request(app)
          .post('/api/sync/backup')
          .attach('database', mockDbBuffer, {
            filename: 'app_backup.db',
            contentType: 'application/octet-stream',
          });

        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('UPLOAD_FAILED');
      } finally {
        (global as any).shouldMockRenameThrow = false;
      }
    });

    it('POST /api/sync/backup — logs warning but returns 200 on GFS copy/rotation failure', async () => {
      const mockDbBuffer = Buffer.from('SQLite format 3\0', 'binary');
      (global as any).shouldMockCopyFileSyncThrow = true;
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const res = await request(app)
          .post('/api/sync/backup')
          .attach('database', mockDbBuffer, {
            filename: 'app_backup.db',
            contentType: 'application/octet-stream',
          });

        expect(res.status).toBe(200);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Snapshot rotation failed'));
      } finally {
        (global as any).shouldMockCopyFileSyncThrow = false;
        consoleErrorSpy.mockRestore();
      }
    });

    it('GET /api/sync/restore — returns 500 when download stream fails', async () => {
      fs.writeFileSync(BACKUP_FILE, 'existing database file');
      const expressResponse = require('express').response;
      const downloadSpy = jest.spyOn(expressResponse, 'download').mockImplementation(function(this: any, p: any, f: any, cb: any) {
        cb(new Error('Mock download error'));
      });

      try {
        const res = await request(app).get('/api/sync/restore');
        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_ERROR');
      } finally {
        downloadSpy.mockRestore();
      }
    });

    it('Global Error Handler — catches synchronous controller exceptions', async () => {
      const { UploadFileSchema } = require('../src/validation');
      const safeParseSpy = jest.spyOn(UploadFileSchema, 'safeParse').mockImplementation(() => {
        throw new Error('Forced parse crash');
      });

      const mockDbBuffer = Buffer.from('SQLite format 3\0', 'binary');

      try {
        const res = await request(app)
          .post('/api/sync/backup')
          .attach('database', mockDbBuffer, {
            filename: 'app_backup.db',
            contentType: 'application/octet-stream',
          });

        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Forced parse crash');
      } finally {
        safeParseSpy.mockRestore();
      }
    });

    it('Global Error Handler — handles raw string exceptions without a message property', async () => {
      const { UploadFileSchema } = require('../src/validation');
      const safeParseSpy = jest.spyOn(UploadFileSchema, 'safeParse').mockImplementation(() => {
        throw 'Forced raw string crash';
      });

      const mockDbBuffer = Buffer.from('SQLite format 3\0', 'binary');

      try {
        const res = await request(app)
          .post('/api/sync/backup')
          .attach('database', mockDbBuffer, {
            filename: 'app_backup.db',
            contentType: 'application/octet-stream',
          });

        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Forced raw string crash');
      } finally {
        safeParseSpy.mockRestore();
      }
    });

    it('mcpApp Global Error Handler — catches exceptions and returns 500', async () => {
      const { server: mcpServer } = require('../src/mcp');
      const originalConnect = mcpServer.connect;
      mcpServer.connect = jest.fn().mockImplementation(() => {
        throw new Error('Forced MCP connect crash');
      });

      try {
        const res = await request(mcpApp).get('/sse');
        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Forced MCP connect crash');
      } finally {
        mcpServer.connect = originalConnect;
      }
    });

    it('mcpApp Global Error Handler — handles raw string exceptions', async () => {
      const { server: mcpServer } = require('../src/mcp');
      const originalConnect = mcpServer.connect;
      mcpServer.connect = jest.fn().mockImplementation(() => {
        throw 'Forced MCP raw string crash';
      });

      try {
        const res = await request(mcpApp).get('/sse');
        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Forced MCP raw string crash');
      } finally {
        mcpServer.connect = originalConnect;
      }
    });

    it('isPortAvailable — resolves true when port is free', async () => {
      const { isPortAvailable } = require('../src/index');
      // Port 0 is dynamically allocated or we use a standard local port we know is free
      const result = await isPortAvailable(0);
      expect(result).toBe(true);
    });

    it('isPortAvailable — resolves false when port is already bound', async () => {
      const { isPortAvailable } = require('../src/index');
      const net = require('net');
      const tempServer = net.createServer();
      
      // Bind to dynamic port
      await new Promise<void>((resolve) => {
        tempServer.listen(0, () => resolve());
      });
      const boundPort = tempServer.address().port;

      try {
        const result = await isPortAvailable(boundPort);
        expect(result).toBe(false);
      } finally {
        await new Promise<void>((resolve) => {
          tempServer.close(() => resolve());
        });
      }
    });
  });
});
