/// <reference types="jest" />
import { handleListTools, handleCallTool, server } from '../src/mcp';
import * as fs from 'fs';
import * as path from 'path';
import initSqlJs from 'sql.js';

const BACKUP_DIR = path.join(__dirname, '../.dev-backups');
const TEST_DB_FILE = path.join(BACKUP_DIR, 'app_backup.db');

describe('MCP Server Tools', () => {
  beforeAll(async () => {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const SQL = await initSqlJs();
    const db = new SQL.Database();

    db.run(`
      CREATE TABLE videos (
        id TEXT PRIMARY KEY,
        url TEXT,
        title TEXT,
        timestamp_added INTEGER,
        transcript_raw TEXT,
        markdown_report TEXT,
        visual_report TEXT,
        status TEXT
      )
    `);

    db.run(`
      CREATE TABLE audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT,
        entity_id TEXT,
        performance_ms INTEGER,
        timestamp INTEGER,
        status TEXT,
        synced INTEGER
      )
    `);

    db.run(
      `INSERT INTO videos (id, url, title, timestamp_added, transcript_raw, markdown_report, status)
       VALUES ('vid-1', 'https://youtube.com/watch?v=1', 'Title One', 12345, 'Raw transcript here', 'Markdown report here', 'complete')`
    );

    db.run(
      `INSERT INTO videos (id, url, title, timestamp_added, transcript_raw, markdown_report, status)
       VALUES ('vid-empty', 'https://youtube.com/watch?v=empty', 'Title Empty', 12346, NULL, NULL, 'pending')`
    );

    db.run(
      `INSERT INTO audit_logs (id, action, entity_id, performance_ms, timestamp, status, synced)
       VALUES ('log-1', 'SYNC_BACKUP', 'vid-1', 150, 54321, 'success', 0)`
    );

    const binaryArray = db.export();
    fs.writeFileSync(TEST_DB_FILE, Buffer.from(binaryArray));
    db.close();
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DB_FILE)) {
      fs.unlinkSync(TEST_DB_FILE);
    }
  });

  it('exposes the required tools', async () => {
    const toolsResponse = await handleListTools();
    expect(toolsResponse.tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'query_videos' }),
        expect.objectContaining({ name: 'query_audit_logs' }),
        expect.objectContaining({ name: 'query_video_transcript' }),
      ])
    );
  });

  it('query_videos returns video list', async () => {
    const result = await handleCallTool('query_videos', {});
    expect(result.content[0].text).toContain('Title One');
    expect(result.content[0].text).toContain('vid-1');
  });

  it('query_audit_logs returns latest logs', async () => {
    const result = await handleCallTool('query_audit_logs', { limit: 10 });
    expect(result.content[0].text).toContain('SYNC_BACKUP');
    expect(result.content[0].text).toContain('log-1');
  });

  it('query_audit_logs executes with default limit if not provided', async () => {
    const result = await handleCallTool('query_audit_logs', {});
    expect(result.content[0].text).toContain('SYNC_BACKUP');
  });

  it('query_video_transcript returns transcript of valid video ID', async () => {
    const result = await handleCallTool('query_video_transcript', { videoId: 'vid-1' });
    expect(result.content[0].text).toContain('Raw transcript here');
    expect(result.content[0].text).toContain('Markdown report here');
  });

  it('query_video_transcript formats fallback text when transcript and report are null', async () => {
    const result = await handleCallTool('query_video_transcript', { videoId: 'vid-empty' });
    expect(result.content[0].text).toContain('No transcript available.');
    expect(result.content[0].text).toContain('No markdown report generated yet.');
  });

  it('query_video_transcript returns error message on missing video ID', async () => {
    const result = await handleCallTool('query_video_transcript', { videoId: 'non-existent' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('not found');
  });

  it('query_video_transcript returns error when videoId is not provided', async () => {
    const result = await handleCallTool('query_video_transcript', {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Missing required argument');
  });

  it('returns error when database is missing on disk', async () => {
    // Delete database temporarily
    if (fs.existsSync(TEST_DB_FILE)) {
      fs.unlinkSync(TEST_DB_FILE);
    }
    try {
      const result = await handleCallTool('query_videos', {});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not found');
    } finally {
      // Re-create the database for subsequent tests or teardowns
      const SQL = await initSqlJs();
      const db = new SQL.Database();
      const binaryArray = db.export();
      fs.writeFileSync(TEST_DB_FILE, Buffer.from(binaryArray));
      db.close();
    }
  });

  it('returns error for unknown tool names', async () => {
    const result = await handleCallTool('unknown_tool', {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown tool name');
  });

  it('handles query execution errors gracefully', async () => {
    // Pass bad binding parameter type to trigger error (e.g. passing an object for limit string parameter)
    const result = await handleCallTool('query_audit_logs', { limit: {} });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Query Execution Error');
  });

  it('integrates with Server JSON-RPC transport interface', async () => {
    const mockTransport = {
      start: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      send: jest.fn(),
      onmessage: null as any,
      onerror: null as any,
      onclose: null as any,
    };

    await server.connect(mockTransport as any);

    // Trigger ListTools
    await mockTransport.onmessage({
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1,
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(mockTransport.send).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        result: expect.objectContaining({
          tools: expect.any(Array),
        }),
      })
    );

    // Trigger CallTool
    await mockTransport.onmessage({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'query_videos',
        arguments: {},
      },
      id: 2,
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(mockTransport.send).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        result: expect.objectContaining({
          content: expect.any(Array),
        }),
      })
    );
  });
});
