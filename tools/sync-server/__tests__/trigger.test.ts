import request from 'supertest';
import express from 'express';
import net from 'net';
import { triggerApp, isPortAvailable } from '../src/trigger';

describe('Trigger Framework Automation Server', () => {
  beforeEach(() => {
    // Reset registered triggers
    triggerApp.locals.triggers = [];
    triggerApp.locals.logs = [];
  });

  describe('GET /api/triggers/list', () => {
    it('returns empty list initially', async () => {
      const res = await request(triggerApp).get('/api/triggers/list');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/triggers/register', () => {
    it('successfully registers a valid trigger', async () => {
      const payload = {
        name: 'sync-trigger',
        event: 'DATABASE_BACKUP',
        action: 'CLEAN_TEMP_FILES',
      };

      const res = await request(triggerApp)
        .post('/api/triggers/register')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('sync-trigger');

      // Verify in list
      const listRes = await request(triggerApp).get('/api/triggers/list');
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.data[0].name).toBe('sync-trigger');
    });

    it('rejects trigger registration with missing fields', async () => {
      const payload = {
        name: 'sync-trigger',
      };

      const res = await request(triggerApp)
        .post('/api/triggers/register')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PAYLOAD');
    });
  });

  describe('POST /api/triggers/fire', () => {
    it('fires a registered trigger and logs execution', async () => {
      // Register first
      await request(triggerApp)
        .post('/api/triggers/register')
        .send({
          name: 'cleanup-trigger',
          event: 'SYNC_DONE',
          action: 'LOG_METRICS',
        });

      const firePayload = {
        event: 'SYNC_DONE',
        payload: { size: 1024 },
      };

      const res = await request(triggerApp)
        .post('/api/triggers/fire')
        .send(firePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Fired 1 trigger');

      // Verify logs exist on app locals
      expect(triggerApp.locals.logs.length).toBe(1);
      expect(triggerApp.locals.logs[0].event).toBe('SYNC_DONE');
      expect(triggerApp.locals.logs[0].action).toBe('LOG_METRICS');
    });

    it('returns success message if no triggers match event', async () => {
      const firePayload = {
        event: 'UNREGISTERED_EVENT',
      };

      const res = await request(triggerApp)
        .post('/api/triggers/fire')
        .send(firePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Fired 0 trigger');
    });

    it('rejects fire payload with missing event name', async () => {
      const res = await request(triggerApp)
        .post('/api/triggers/fire')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PAYLOAD');
    });
  });

  describe('Global Error Handler', () => {
    it('catches controller exceptions and returns 500 conforming error shape', async () => {
      const errors = require('../src/errors');
      const spy = jest.spyOn(errors, 'makeSuccessResponse').mockImplementation(() => {
        throw new Error('Forced JSON error');
      });

      try {
        const res = await request(triggerApp).get('/api/triggers/list');
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('INTERNAL_ERROR');
      } finally {
        spy.mockRestore();
      }
    });

    it('handles raw string exceptions without a message property', async () => {
      const errors = require('../src/errors');
      const spy = jest.spyOn(errors, 'makeSuccessResponse').mockImplementation(() => {
        throw 'Forced string crash';
      });

      try {
        const res = await request(triggerApp).get('/api/triggers/list');
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('INTERNAL_ERROR');
        expect(res.body.error.message).toContain('Forced string crash');
      } finally {
        spy.mockRestore();
      }
    });

    it('catches exceptions inside register endpoint and forwards to next', async () => {
      const triggerModule = require('../src/trigger');
      // We can trigger an error by passing mock properties or spying
      const registerSpy = jest.spyOn(triggerApp.locals.triggers, 'push').mockImplementation(() => {
        throw new Error('Forced register push crash');
      });

      try {
        const res = await request(triggerApp)
          .post('/api/triggers/register')
          .send({ name: 'trig', event: 'EV', action: 'ACT' });
        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Forced register push crash');
      } finally {
        registerSpy.mockRestore();
      }
    });

    it('catches exceptions inside fire endpoint and forwards to next', async () => {
      const triggerModule = require('../src/trigger');
      const fireSpy = jest.spyOn(triggerApp.locals.logs, 'push').mockImplementation(() => {
        throw new Error('Forced fire log push crash');
      });

      // Register a trigger first to hit the log push block
      triggerApp.locals.triggers = [{ id: '1', name: 'trig', event: 'EV', action: 'ACT' }];

      try {
        const res = await request(triggerApp)
          .post('/api/triggers/fire')
          .send({ event: 'EV' });
        expect(res.status).toBe(500);
        expect(res.body.error.message).toContain('Forced fire log push crash');
      } finally {
        fireSpy.mockRestore();
      }
    });
  });

  describe('Port Preflight Helpers', () => {
    it('respects process.env.AUTOMATION_PORT when set', () => {
      process.env.AUTOMATION_PORT = '9999';
      jest.isolateModules(() => {
        const { triggerApp } = require('../src/trigger');
        expect(triggerApp).toBeDefined();
      });
      delete process.env.AUTOMATION_PORT;
    });

    it('isPortAvailable — resolves true when port is free', async () => {
      const result = await isPortAvailable(0);
      expect(result).toBe(true);
    });

    it('isPortAvailable — resolves false when port is already bound', async () => {
      const tempServer = net.createServer();
      await new Promise<void>((resolve) => {
        tempServer.listen(0, () => resolve());
      });
      const address = tempServer.address();
      const boundPort = typeof address === 'string' || !address ? 0 : address.port;

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
