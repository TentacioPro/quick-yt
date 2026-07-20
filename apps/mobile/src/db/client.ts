/**
 * client.ts
 * Drizzle ORM database client for Quick_yt.
 * Wraps expo-sqlite openDatabaseSync and provides:
 *  - A singleton `getDb()` accessor
 *  - `initDatabase()` to run schema migrations inline (no drizzle-kit at runtime)
 */

import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const DB_NAME = 'app.db';

// Singleton SQLite handle
let _sqliteDb: SQLite.SQLiteDatabase | null = null;
let _drizzleDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Returns the raw expo-sqlite database handle.
 * Used by audit.ts for direct runAsync calls without Drizzle overhead.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!_sqliteDb) {
    _sqliteDb = SQLite.openDatabaseSync(DB_NAME);
  }
  return _sqliteDb;
}

/**
 * Returns the Drizzle-wrapped database client.
 * Used by feature code (skills, sync) for type-safe queries.
 */
export function getDrizzleDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_drizzleDb) {
    _drizzleDb = drizzle(getDb(), { schema });
  }
  return _drizzleDb;
}

/**
 * initDatabase() — runs CREATE TABLE IF NOT EXISTS for all schema tables.
 * Called once at app startup before any queries.
 */
export async function initDatabase(): Promise<void> {
  const db = getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      timestamp_added INTEGER NOT NULL,
      transcript_raw TEXT,
      markdown_report TEXT,
      visual_report TEXT,
      status TEXT DEFAULT 'pending'
    );
  `);

  try {
    await db.execAsync(`
      ALTER TABLE videos ADD COLUMN visual_report TEXT;
    `);
  } catch (err) {
    // Ignore error if column already exists
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      action TEXT NOT NULL,
      entity_id TEXT,
      performance_ms INTEGER,
      timestamp INTEGER NOT NULL,
      status TEXT,
      synced INTEGER DEFAULT 0
    );
  `);

  // Add the synced column if the table already existed without it (DDL migration patch)
  try {
    await db.execAsync(`
      ALTER TABLE audit_logs ADD COLUMN synced INTEGER DEFAULT 0;
    `);
  } catch (err) {
    // Ignore error if column already exists
  }
}

/**
 * resetDb() — for test isolation only. Clears singletons.
 * Never call in production code.
 */
export function resetDb(): void {
  _sqliteDb = null;
  _drizzleDb = null;
}
