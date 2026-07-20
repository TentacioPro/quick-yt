import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import { useToastStore } from '../store/useToastStore';
import { withAuditCatch } from '../db/withAuditCatch';

export const PC_IP = 'http://192.168.1.100:4100'; // Replace with actual Windows IP in production
const DB_NAME = 'app.db';
const DB_DIR = `${FileSystem.documentDirectory}SQLite`;
const DB_PATH = `${DB_DIR}/${DB_NAME}`;

/**
 * backupToPC — uploads local SQLite database file to sync-server.
 * Wrapped in withAuditCatch to log performance/outcome.
 * Shows Snackbar on success or failure.
 */
export async function backupToPC(): Promise<void> {
  try {
    await withAuditCatch('SYNC_BACKUP', null, async () => {
      // Ensure the source database file actually exists first
      const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
      if (!fileInfo.exists) {
        throw new Error(`Local database file does not exist at path: ${DB_PATH}`);
      }

      const response = await FileSystem.uploadAsync(
        `${PC_IP}/api/sync/backup`,
        DB_PATH,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'database',
        }
      );

      if (response.status !== 200) {
        let errMsg = `Upload failed with status ${response.status}`;
        try {
          const bodyJson = JSON.parse(response.body);
          if (bodyJson.success === false && bodyJson.error?.message) {
            errMsg = bodyJson.error.message;
          }
        } catch (_) {}
        throw new Error(`Database backup failed: ${errMsg}`);
      }
    });

    useToastStore.getState().show('Backup complete', 'success');
  } catch (error) {
    const errMessage = (error as Error).message || 'Unknown error occurred';
    useToastStore.getState().show(`Sync failed: ${errMessage}`, 'error');
    throw error;
  }
}

/**
 * restoreFromPC — downloads backed up SQLite database file from sync-server,
 * overwriting local database, and reloads the application.
 * Wrapped in withAuditCatch to log performance/outcome.
 * Shows Snackbar on success or failure.
 */
export async function restoreFromPC(): Promise<void> {
  try {
    await withAuditCatch('SYNC_RESTORE', null, async () => {
      // Ensure the SQLite directory exists first
      await FileSystem.makeDirectoryAsync(DB_DIR, { intermediates: true });

      const response = await FileSystem.downloadAsync(
        `${PC_IP}/api/sync/restore`,
        DB_PATH
      );

      if (response.status !== 200) {
        throw new Error(`Database restore failed with status ${response.status}`);
      }
    });

    useToastStore.getState().show('Restore complete', 'success');
    // Reload database structure by restarting Hermes/JS engine
    await Updates.reloadAsync();
  } catch (error) {
    const errMessage = (error as Error).message || 'Unknown error occurred';
    useToastStore.getState().show(`Sync failed: ${errMessage}`, 'error');
    throw error;
  }
}
