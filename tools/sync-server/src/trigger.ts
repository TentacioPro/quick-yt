import express from 'express';
import cors from 'cors';
import net from 'net';
import { z } from 'zod';
import { makeSuccessResponse, makeErrorResponse } from './errors';

const triggerApp = express();
const PORT = parseInt(process.env.AUTOMATION_PORT || '4102', 10);

triggerApp.use(cors());
triggerApp.use(express.json());

// Initialize store in locals
triggerApp.locals.triggers = [];
triggerApp.locals.logs = [];

// Zod schemas for input validation
const RegisterTriggerSchema = z.object({
  name: z.string().min(1),
  event: z.string().min(1),
  action: z.string().min(1),
});

const FireTriggerSchema = z.object({
  event: z.string().min(1),
  payload: z.record(z.any()).optional(),
});

// Helper for port checking
export function isPortAvailable(port: number): Promise<boolean> {
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

// 1. GET /api/triggers/list
triggerApp.get('/api/triggers/list', (req, res, next) => {
  try {
    res.json(makeSuccessResponse(triggerApp.locals.triggers));
  } catch (err) {
    next(err);
  }
});

// 2. POST /api/triggers/register
triggerApp.post('/api/triggers/register', (req, res, next) => {
  try {
    const validation = RegisterTriggerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json(
        makeErrorResponse(
          'INVALID_PAYLOAD',
          `Validation failed: ${validation.error.message}`
        )
      );
      return;
    }

    const newTrigger = {
      id: `trig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...validation.data,
      createdAt: Date.now(),
    };

    triggerApp.locals.triggers.push(newTrigger);
    res.status(201).json(makeSuccessResponse(newTrigger, 'Trigger registered successfully.'));
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/triggers/fire
triggerApp.post('/api/triggers/fire', (req, res, next) => {
  try {
    const validation = FireTriggerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json(
        makeErrorResponse(
          'INVALID_PAYLOAD',
          `Validation failed: ${validation.error.message}`
        )
      );
      return;
    }

    const { event, payload } = validation.data;
    const matchingTriggers = triggerApp.locals.triggers.filter(
      (t: any) => t.event === event
    );

    const executedLogs: any[] = [];
    matchingTriggers.forEach((trigger: any) => {
      const logEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        triggerId: trigger.id,
        event,
        action: trigger.action,
        payload,
        timestamp: Date.now(),
      };
      triggerApp.locals.logs.push(logEntry);
      executedLogs.push(logEntry);
    });

    res.json(
      makeSuccessResponse(
        executedLogs,
        `Fired ${matchingTriggers.length} trigger(s) for event ${event}.`
      )
    );
  } catch (err) {
    next(err);
  }
});

// Global error handler
triggerApp.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    void req; void next;
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

// Only listen if this file is run directly (not in tests)
/* istanbul ignore next */
async function startServer() {
  const available = await isPortAvailable(PORT);
  if (!available) {
    console.error(`[trigger-server] Error: Port ${PORT} is already in use.`);
    process.exit(1);
  }

  triggerApp.listen(PORT, () => {
    console.log(`[trigger-server] Running on http://0.0.0.0:${PORT}`);
  });
}

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(console.error);
}

export { triggerApp };
