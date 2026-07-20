# Local Dev Sync & MCP Server Specs

To facilitate continuous development across builds, the application state must be extractable and restorable via a local Windows server. This server can be containerized using Docker to maintain a clean host environment.

## 1. Windows Host Configuration
- Ensure the Windows machine network profile is set to "Private".
- Identify the local IPv4 address (e.g., `192.168.1.100`).
- Ensure the firewall allows TCP traffic on port `4000`.

## 2. Express Server (`tools/sync-server`)
```typescript
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const BACKUP_DIR = path.join(__dirname, '.dev-backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, BACKUP_DIR),
  filename: (req, file, cb) => cb(null, 'app_backup.db'),
});
const upload = multer({ storage });

// Endpoint: App pushes DB to PC
app.post('/api/sync/backup', upload.single('database'), (req, res) => {
  res.json({ success: true, message: 'Database backed up to Windows PC.' });
});

// Endpoint: App pulls DB from PC
app.get('/api/sync/restore', (req, res) => {
  const dbPath = path.join(BACKUP_DIR, 'app_backup.db');
  if (fs.existsSync(dbPath)) {
    res.download(dbPath);
  } else {
    res.status(404).json({ error: 'No backup found.' });
  }
});

app.listen(4000, () => console.log('Sync Server running on port 4000'));
```

## 3. Expo Mobile Implementation (`DevSyncManager.ts`)
```typescript
import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';

const PC_IP = 'http://192.168.1.100:4000'; // Replace with actual Windows IP
const DB_NAME = 'app.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

export const backupToPC = async () => {
  await FileSystem.uploadAsync(`${PC_IP}/api/sync/backup`, DB_PATH, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'database',
  });
};

export const restoreFromPC = async () => {
  await FileSystem.downloadAsync(`${PC_IP}/api/sync/restore`, DB_PATH);
  // Reload app to re-initialize SQLite with the new file
  await Updates.reloadAsync();
};
```
