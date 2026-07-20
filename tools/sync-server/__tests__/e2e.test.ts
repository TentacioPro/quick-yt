import * as path from 'path';
import * as fs from 'fs';
const BACKUP_DIR = path.join(__dirname, '../.dev-backups');
const BACKUP_FILE = path.join(BACKUP_DIR, 'e2e_backup.db');
process.env.DB_FILE = BACKUP_FILE;

// Delete directory first to trigger mkdirSync on load coverage
if (fs.existsSync(BACKUP_DIR)) {
  fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
}

import { app, mcpApp } from '../src/index';
import http from 'http';
import initSqlJs from 'sql.js';
import request from 'supertest';

describe('Full End-to-End HTTP SSE & Sync Verification', () => {
  let syncServer: http.Server;
  let mcpServer: http.Server;

  beforeAll(async () => {
    console.log('=== e2e.test.ts BACKUP_FILE ===', BACKUP_FILE);
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Write a mock database to satisfy query tools
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run('CREATE TABLE IF NOT EXISTS videos (id TEXT PRIMARY KEY, url TEXT, title TEXT, status TEXT)');
    db.run("INSERT INTO videos (id, url, title, status) VALUES ('vid-e2e', 'https://youtube.com/watch?v=123', 'E2E Verification Video', 'complete')");
    const binaryArray = db.export();
    fs.writeFileSync(BACKUP_FILE, Buffer.from(binaryArray));
    db.close();

    // Start servers dynamically on port 4100 and 4101
    syncServer = app.listen(4100);
    mcpServer = mcpApp.listen(4101);
  });

  afterAll(async () => {
    // Close servers
    await new Promise<void>((resolve) => syncServer.close(() => resolve()));
    await new Promise<void>((resolve) => mcpServer.close(() => resolve()));

    // Clean up database file
    if (fs.existsSync(BACKUP_FILE)) {
      fs.unlinkSync(BACKUP_FILE);
    }
  });

  it('establishes a real SSE connection, processes a tool call, and runs sync workflows', (done) => {
    // 1. Connect to SSE Stream on port 4101
    const sseReq = http.get('http://127.0.0.1:4101/sse', (res) => {
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.statusCode).toBe(200);

      let buffer = '';
      let postSent = false;
      res.setEncoding('utf8');
      res.on('data', async (chunk) => {
        buffer += chunk;
        
        // SSE handshake returns the messages endpoint containing sessionId
        if (!postSent && buffer.includes('event: endpoint') && buffer.includes('data:')) {
          postSent = true;
          const lines = buffer.split('\n');
          const dataLine = lines.find(line => line.startsWith('data:'));
          if (dataLine) {
            const endpointPath = dataLine.replace('data:', '').trim(); // e.g. /messages?sessionId=xxxx
            
            // 2. Dispatch a tool call request to the messages endpoint
            const toolCallPayload = {
              jsonrpc: '2.0',
              method: 'tools/call',
              params: {
                name: 'query_videos',
                arguments: {},
              },
              id: 999,
            };

            const parsedUrl = new URL(`http://127.0.0.1:4101${endpointPath}`);
            const postOptions = {
              hostname: parsedUrl.hostname,
              port: parsedUrl.port,
              path: parsedUrl.pathname + parsedUrl.search,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            };

            const postReq = http.request(postOptions, (postRes) => {
              let body = '';
              postRes.setEncoding('utf8');
              postRes.on('data', (chunk) => body += chunk);
              postRes.on('end', () => {
                expect(postRes.statusCode).toBe(202);
              });
            });
            postReq.write(JSON.stringify(toolCallPayload));
            postReq.end();
          }
        }

        // Wait for JSON-RPC response streamed back over the SSE channel
        if (buffer.includes('"jsonrpc":"2.0"') && buffer.includes('vid-e2e')) {
          expect(buffer).toContain('E2E Verification Video');
          sseReq.destroy();
          done();
        }
      });
    });

    sseReq.on('error', (err) => {
      done(err);
    });
  });

  it('handles database sync backup and restore on port 4100', async () => {
    const mockDbBuffer = Buffer.from('SQLite format 3\0', 'binary');

    // Test Backup POST
    const backupRes = await request('http://127.0.0.1:4100')
      .post('/api/sync/backup')
      .attach('database', mockDbBuffer, {
        filename: 'app_backup.db',
        contentType: 'application/octet-stream',
      });

    expect(backupRes.status).toBe(200);
    expect(backupRes.body.success).toBe(true);
    expect(backupRes.body.message).toContain('backed up');

    // Test Restore GET
    const restoreRes = await request('http://127.0.0.1:4100')
      .get('/api/sync/restore');

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.headers['content-type']).toBe('application/octet-stream');
    expect(restoreRes.body.toString()).toContain('SQLite');
  });
});
