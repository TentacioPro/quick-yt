/**
 * TDD — RED STEP
 * schema.test.ts
 * Task 02: Asserts that the Drizzle schema exports match the exact column definitions
 * specified in 02_Architecture_and_TDD.md (L27–L48).
 * Task 16: Asserts new videoNotes table exists for Video Notes feed.
 * Must FAIL on empty/missing implementation.
 */

import { videos, auditLogs, videoNotes } from '../../src/db/schema';

describe('Drizzle Schema — videos table', () => {
  it('① exports a videos table object', () => {
    expect(videos).toBeDefined();
  });

  it('② videos table has all required columns', () => {
    const columnNames = Object.keys(videos);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('url');
    expect(columnNames).toContain('title');
    expect(columnNames).toContain('timestampAdded');
    expect(columnNames).toContain('transcriptRaw');
    expect(columnNames).toContain('markdownReport');
    expect(columnNames).toContain('visualReport');
    expect(columnNames).toContain('status');
  });

  it("③ videos.status column has default value 'pending'", () => {
    // Drizzle stores the default in the column config
    const statusCol = (videos as any).status;
    expect(statusCol?.default).toBe('pending');
  });
});

describe('Drizzle Schema — auditLogs table', () => {
  it('① exports an auditLogs table object', () => {
    expect(auditLogs).toBeDefined();
  });

  it('② auditLogs table has all required columns', () => {
    const columnNames = Object.keys(auditLogs);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('action');
    expect(columnNames).toContain('entityId');
    expect(columnNames).toContain('performanceMs');
    expect(columnNames).toContain('timestamp');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('synced');
  });

  it('③ auditLogs.synced column has default value of 0', () => {
    const syncedCol = (auditLogs as any).synced;
    expect(syncedCol?.default).toBe(0);
  });
});

describe('Drizzle Schema — videoNotes table', () => {
  it('① exports a videoNotes table object', () => {
    expect(videoNotes).toBeDefined();
  });

  it('② videoNotes table has all required columns', () => {
    const columnNames = Object.keys(videoNotes);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('videoId');
    expect(columnNames).toContain('content');
    expect(columnNames).toContain('timestamp');
    expect(columnNames).toContain('synced');
    expect(columnNames).toContain('videoTimestamp');
    expect(columnNames).toContain('tags');
  });

  it('③ videoNotes.synced column has default value of 0', () => {
    const syncedCol = (videoNotes as any).synced;
    expect(syncedCol?.default).toBe(0);
  });
});
