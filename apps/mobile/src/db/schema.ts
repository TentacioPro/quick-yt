/**
 * schema.ts
 * Drizzle ORM table definitions for Quick_yt.
 * Source of truth: 02_Architecture_and_TDD.md (L27–L48).
 * Do NOT deviate from column names or types without a new numbered task.
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  title: text('title'),
  timestampAdded: integer('timestamp_added').notNull(),
  transcriptRaw: text('transcript_raw'),
  markdownReport: text('markdown_report'),
  visualReport: text('visual_report'),
  status: text('status').default('pending'),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  entityId: text('entity_id'),
  performanceMs: integer('performance_ms'),
  timestamp: integer('timestamp').notNull(),
  status: text('status'),
  synced: integer('synced').default(0),
});

// Derived types for use across the app
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export const videoNotes = sqliteTable('video_notes', {
  id: text('id').primaryKey(),
  videoId: text('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  timestamp: integer('timestamp').notNull(),
  synced: integer('synced').default(0),
  videoTimestamp: integer('video_timestamp'),
  tags: text('tags'),
});

export type VideoNote = typeof videoNotes.$inferSelect;
export type NewVideoNote = typeof videoNotes.$inferInsert;
