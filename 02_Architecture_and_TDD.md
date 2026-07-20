# System Architecture & TDD Specifications

## Monorepo Structure
```text
/workspace
├── apps/
│   └── mobile/                 # React Native Expo App
│       ├── src/
│       │   ├── db/             # Drizzle schemas & migrations
│       │   ├── store/          # Zustand state management
│       │   ├── skills/         # Portable modules (Transcript Extractor)
│       │   ├── sync/           # DevSyncManager for local Windows sync
│       │   └── ui/             # React Native Paper components
│       ├── app.json
│       └── package.json
├── tools/
│   └── sync-server/            # Local Windows Sync & MCP Node
│       ├── src/
│       │   └── index.ts        # Express API logic
│       ├── .dev-backups/       # Stored SQLite databases from the device
│       ├── Dockerfile          # Containerization for isolated execution
│       └── package.json
└── package.json                # pnpm workspace root
```

## Database Schema (Drizzle ORM)
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  title: text('title'),
  timestampAdded: integer('timestamp_added').notNull(),
  transcriptRaw: text('transcript_raw'),
  markdownReport: text('markdown_report'),
  status: text('status').default('pending'),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  entityId: text('entity_id'),
  performanceMs: integer('performance_ms'),
  timestamp: integer('timestamp').notNull(),
  status: text('status'),
});
```

## TDD Setup & Mocks
To maintain system integrity, unit tests must execute without a physical device. 

**Jest Setup (`jest.setup.js`):**
```javascript
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
  })),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://mock/directory/',
  uploadAsync: jest.fn(),
  downloadAsync: jest.fn(),
}));
```
**Coverage Requirements:** 
- 100% coverage on `DevSyncManager` payload formatting.
- 100% coverage on `audit_logs` insertion wrappers.
