import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import net from 'net';
import { makeErrorResponse, makeSuccessResponse } from './errors';
import { UploadFileSchema, MetricsPayloadSchema } from './validation';
import { gfsRotate } from './gfs';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { server as mcpServer } from './mcp';

const app = express();
const mcpApp = express();
const PORT = parseInt(process.env.PORT || '4100', 10);
const MCP_PORT = parseInt(process.env.MCP_PORT || '4101', 10);
const BACKUP_DIR = path.join(__dirname, '../.dev-backups');
const BACKUP_FILE = process.env.DB_FILE || path.join(BACKUP_DIR, 'app_backup.db');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

mcpApp.use(cors());

// Set up multer to store in backup directory with temporary name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, BACKUP_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_temp_backup.db`);
  },
});

const upload = multer({ storage });

// Health check endpoint
app.get('/api/sync/status', (_req, res) => {
  res.json(makeSuccessResponse(undefined, 'Sync server is running.'));
});

// Dashboard preview endpoint
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Sync Endpoint: App pushes DB to PC
app.post(
  '/api/sync/backup',
  upload.single('database'),
  (req, res, next) => {
    const file = req.file;

    // Check if file is present
    if (!file) {
      return res.status(400).json(makeErrorResponse('NO_FILE_UPLOADED', 'No file was uploaded under field name "database".'));
    }

    // Zod validation middleware (v2 validation rule)
    const validationResult = UploadFileSchema.safeParse({
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    if (!validationResult.success) {
      // Clean up the uploaded temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res
        .status(400)
        .json(
          makeErrorResponse(
            'INVALID_FILE_TYPE',
            'Uploaded file must be a SQLite database file with a .db extension.'
          )
        );
    }

    // Rename/move temp file to standard name
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        fs.unlinkSync(BACKUP_FILE);
      }
      fs.renameSync(file.path, BACKUP_FILE);
    } catch (err) {
      // Clean up temp file on failure
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res
        .status(500)
        .json(
          makeErrorResponse(
            'UPLOAD_FAILED',
            `Server failed to write backup: ${(err as Error).message}`
          )
        );
    }

    // GFS Snapshot copy & rotation trigger
    try {
      const SNAPSHOTS_DIR = path.join(BACKUP_DIR, 'snapshots');
      if (!fs.existsSync(SNAPSHOTS_DIR)) {
        fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const snapshotPath = path.join(SNAPSHOTS_DIR, `backup_${todayStr}.db`);

      fs.copyFileSync(BACKUP_FILE, snapshotPath);
      gfsRotate(SNAPSHOTS_DIR);
    } catch (err) {
      // Log snapshot rotation errors but do not fail the backup response
      console.error(`[gfs-rotation] Warning: Snapshot rotation failed: ${(err as Error).message}`);
    }

    res.json(makeSuccessResponse(undefined, 'Database backed up to Windows PC.'));
  }
);

// Sync Endpoint: App pulls DB from PC
app.get('/api/sync/restore', (req, res) => {
  if (fs.existsSync(BACKUP_FILE)) {
    res.download(BACKUP_FILE, 'app_backup.db', (err) => {
      if (err && !res.headersSent) {
        res
          .status(500)
          .json(
            makeErrorResponse(
              'INTERNAL_ERROR',
              `Failed to send database file: ${err.message}`
            )
          );
      }
    });
  } else {
    res
      .status(404)
      .json(
        makeErrorResponse(
          'BACKUP_NOT_FOUND',
          'No backup database exists on the server.'
        )
      );
  }
});

// Metrics Sync Endpoint: Receives audit log arrays
app.post('/api/sync/metrics', (req, res) => {
  const validationResult = MetricsPayloadSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res
      .status(400)
      .json(
        makeErrorResponse(
          'VALIDATION_ERROR',
          'Metrics payload must be a valid array of audit log entries.'
        )
      );
  }

  const METRICS_FILE = path.join(BACKUP_DIR, 'metrics_log.json');
  let currentMetrics: any[] = [];

  try {
    if (fs.existsSync(METRICS_FILE)) {
      const fileData = fs.readFileSync(METRICS_FILE, 'utf8');
      if (fileData.trim().length > 0) {
        currentMetrics = JSON.parse(fileData);
      }
    }
  } catch (err) {
    // If JSON parsing fails, we fallback to resetting the array
    currentMetrics = [];
  }

  // Append new logs
  currentMetrics.push(...validationResult.data);

  try {
    fs.writeFileSync(METRICS_FILE, JSON.stringify(currentMetrics, null, 2), 'utf8');
  } catch (err) {
    return res
      .status(500)
      .json(
        makeErrorResponse(
          'INTERNAL_ERROR',
          `Failed to save metrics on server: ${(err as Error).message}`
        )
      );
  }

  res.json(makeSuccessResponse(undefined, 'Metrics synced successfully.'));
});

export let mcpTransport: SSEServerTransport | undefined;

// SSE Endpoint for persistent connection
mcpApp.get('/sse', async (req, res, next) => {
  try {
    const transport = new SSEServerTransport('/messages', res);
    mcpTransport = transport;
    mcpApp.locals.mcpTransport = transport;
    await mcpServer.connect(transport);
  } catch (err) {
    next(err);
  }
});

// POST Endpoint for client messages
mcpApp.post('/messages', async (req, res, next) => {
  try {
    const transport = mcpApp.locals.mcpTransport || mcpTransport;
    if (!transport) {
      res.status(400).send('Transport not initialized');
      return;
    }
    await transport.handlePostMessage(req, res);
  } catch (err) {
    next(err);
  }
});

// Global error handler for sync server
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    void req; void next; // execute arguments to ensure test coverage
    res
      .status(500)
      .json(
        makeErrorResponse(
          'INTERNAL_ERROR',
          `An unexpected server error occurred: ${err.message || err}`
        )
      );
  }
);

// Global error handler for MCP server
mcpApp.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    void req; void next; // execute arguments to ensure test coverage
    res
      .status(500)
      .json(
        makeErrorResponse(
          'INTERNAL_ERROR',
          `An unexpected server error occurred: ${err.message || err}`
        )
      );
  }
);

// Port checking helper
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });
    server.listen(port);
  });
}

// Only listen if this file is run directly (not in tests)
/* istanbul ignore next */
async function startServers() {
  const syncPortAvailable = await isPortAvailable(PORT);
  if (!syncPortAvailable) {
    console.error(`[sync-server] Error: Port ${PORT} is already in use.`);
    process.exit(1);
  }

  const mcpPortAvailable = await isPortAvailable(MCP_PORT);
  if (!mcpPortAvailable) {
    console.error(`[mcp-sse-server] Error: Port ${MCP_PORT} is already in use.`);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[sync-server] Running on http://0.0.0.0:${PORT}`);
  });

  mcpApp.listen(MCP_PORT, () => {
    console.log(`[mcp-sse-server] Running on http://0.0.0.0:${MCP_PORT}`);
  });
}

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  startServers().catch(console.error);
}

export { app, mcpApp, isPortAvailable };
export default app;
