/**
 * jest.setup.js
 * Task 01 — provides mock stubs for device-only modules so tests run on Node.
 * Task 02 will fill in detailed mock implementations for expo-sqlite.
 *
 * Mocks exactly per specs/tasks/02_Architecture_and_TDD.md § TDD Setup & Mocks.
 */

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
  FileSystemUploadType: {
    MULTIPART: 'multipart',
  },
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
    Warning: 'warning',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-updates', () => ({
  reloadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(() =>
    Promise.resolve({ uri: 'file://mock/output.pdf' })
  ),
}));
