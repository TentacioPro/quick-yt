import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import initSqlJs from 'sql.js';

const BACKUP_DIR = path.join(__dirname, '../.dev-backups');
const DB_FILE = process.env.DB_FILE || path.join(BACKUP_DIR, 'app_backup.db');

const server = new Server(
  {
    name: 'quick-yt-mcp-server',
    version: '0.0.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Helper to open the SQLite database using sql.js.
 * Reads the active app_backup.db from disk.
 */
async function openDb(): Promise<any> {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error('Database file app_backup.db not found. Run a sync backup first.');
  }

  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(DB_FILE);
  return new SQL.Database(fileBuffer);
}

/**
 * handleListTools — Returns list of supported tools.
 */
export async function handleListTools() {
  return {
    tools: [
      {
        name: 'query_videos',
        description: 'Retrieve a list of all videos, including their URLs, titles, and processing status.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'query_audit_logs',
        description: 'Retrieve a list of the latest system audit logs for debugging performance and database writes.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of audit logs to retrieve (default 50).',
              minimum: 1,
              maximum: 100,
            },
          },
        },
      },
      {
        name: 'query_video_transcript',
        description: 'Retrieve the raw transcript and structured markdown report for a specific video ID.',
        inputSchema: {
          type: 'object',
          properties: {
            videoId: {
              type: 'string',
              description: 'The unique ID of the video record.',
            },
          },
          required: ['videoId'],
        },
      },
    ],
  };
}

/**
 * handleCallTool — Routes and executes tools against the SQLite DB backup.
 */
export async function handleCallTool(name: string, args: any): Promise<any> {
  let db: any;

  try {
    db = await openDb();
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: (err as Error).message,
        },
      ],
    };
  }

  try {
    if (name === 'query_videos') {
      const stmt = db.prepare('SELECT id, url, title, status FROM videos');
      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }

    if (name === 'query_audit_logs') {
      const limit = args.limit || 50;
      const stmt = db.prepare(
        'SELECT id, action, entity_id, performance_ms, timestamp, status, synced FROM audit_logs ORDER BY timestamp DESC LIMIT ?'
      );
      stmt.bind([limit]);
      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    }

    if (name === 'query_video_transcript') {
      const videoId = args.videoId;
      if (!videoId) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'Missing required argument: videoId',
            },
          ],
        };
      }

      const stmt = db.prepare('SELECT transcript_raw, markdown_report FROM videos WHERE id = ?');
      stmt.bind([videoId]);
      let row: any = null;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();

      if (!row) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Video with ID "${videoId}" was not found in the database.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `=== Transcript ===\n${row.transcript_raw || 'No transcript available.'}\n\n=== Markdown Report ===\n${row.markdown_report || 'No markdown report generated yet.'}`,
          },
        ],
      };
    }

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Unknown tool name: ${name}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `SQL Query Execution Error: ${(error as Error).message}`,
        },
      ],
    };
  } finally {
    db.close();
  }
}

// Bind handlers to the SDK Server instance
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return handleListTools();
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleCallTool(name, args);
});

/* istanbul ignore next */
export async function runMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/* istanbul ignore next */
if (require.main === module) {
  runMcpServer().catch(console.error);
}

export { server };
