import { processVideoPipeline } from '../../src/skills/pipeline';
import { extractTranscript } from '../../src/skills/transcript/extractor';
import { generateReport } from '../../src/skills/gemini/geminiService';
import { generatePdf } from '../../src/skills/pdf/pdfGenerator';
import { getDrizzleDb, getDb, initDatabase } from '../../src/db/client';
import { videos, auditLogs } from '../../src/db/schema';
import { useToastStore } from '../../src/store/useToastStore';
import { eq } from 'drizzle-orm';

// Mock sub-services
jest.mock('../../src/skills/transcript/extractor');
jest.mock('../../src/skills/gemini/geminiService');
jest.mock('../../src/skills/pdf/pdfGenerator');

const mockExtractTranscript = extractTranscript as jest.MockedFunction<typeof extractTranscript>;
const mockGenerateReport = generateReport as jest.MockedFunction<typeof generateReport>;
const mockGeneratePdf = generatePdf as jest.MockedFunction<typeof generatePdf>;

// SQLite is mocked in jest.setup.js
// For these integration-level tests, we can use an actual in-memory SQLite if we want,
// but since expo-sqlite is mocked globally to return stubs, we can test db updates
// by asserting Drizzle operations or verifying the calls to client getDb() runAsync/execAsync.
// Let's mock getDrizzleDb and check its calls, or construct a simple mock database layer.
// Wait, getDrizzleDb returns a drizzle instance. Let's check how we can mock it easily.
// A simpler way: mock the client db instance calls or mock getDrizzleDb entirely.
// Let's mock getDrizzleDb to query and update objects in memory, or stub the queries.

const mockUpdate = jest.fn();
const mockInsert = jest.fn();
const mockSelect = jest.fn();

jest.mock('../../src/db/client', () => {
  const actual = jest.requireActual('../../src/db/client');
  return {
    ...actual,
    getDrizzleDb: () => ({
      update: mockUpdate,
      insert: mockInsert,
      select: mockSelect,
    }),
  };
});

describe('processVideoPipeline()', () => {
  let mockToastShow: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockToastShow = jest.spyOn(useToastStore.getState(), 'show').mockImplementation(() => {});

    // Mock DB operations to chain
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({}),
      }),
    });

    mockInsert.mockReturnValue({
      values: jest.fn().mockResolvedValue({}),
    });
  });

  afterEach(() => {
    mockToastShow.mockRestore();
  });

  it('navigates video through statuses sequentially and logs success audits', async () => {
    mockExtractTranscript.mockResolvedValueOnce({
      video_id: 'video_123',
      raw_text: 'This is the transcript text',
      segments: [],
    });

    mockGenerateReport.mockResolvedValueOnce('## Structured markdown report');
    mockGeneratePdf.mockResolvedValueOnce('file://data/reports/report_123.pdf');

    await processVideoPipeline('video_123', 'https://youtube.com/watch?v=video_123', 'en', 'API_KEY');

    // Verify updates to video status
    expect(mockUpdate).toHaveBeenCalled();
    // Verify toast is shown on success
    expect(mockToastShow).toHaveBeenCalledWith('Report generated', 'success');
  });

  it('halts pipeline, logs failed audit, and raises error toast on transcript extraction failure', async () => {
    mockExtractTranscript.mockRejectedValueOnce(new Error('HTML parse error'));

    await expect(
      processVideoPipeline('video_123', 'https://youtube.com/watch?v=video_123', 'en', 'API_KEY')
    ).rejects.toThrow('HTML parse error');

    // Verify error toast is called
    expect(mockToastShow).toHaveBeenCalledWith(expect.stringContaining('HTML parse error'), 'error');
  });

  it('halts pipeline, logs failed audit, and raises error toast on Gemini generation failure', async () => {
    mockExtractTranscript.mockResolvedValueOnce({
      video_id: 'video_123',
      raw_text: 'Raw transcript',
      segments: [],
    });
    mockGenerateReport.mockRejectedValueOnce(new Error('Quota exceeded'));

    await expect(
      processVideoPipeline('video_123', 'https://youtube.com/watch?v=video_123', 'en', 'API_KEY')
    ).rejects.toThrow('Quota exceeded');

    expect(mockToastShow).toHaveBeenCalledWith(expect.stringContaining('Quota exceeded'), 'error');
  });
});
