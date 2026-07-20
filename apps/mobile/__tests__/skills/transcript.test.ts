import { extractTranscript, TranscriptError } from '../../src/skills/transcript/extractor';
import { ZodError } from 'zod';
import * as fs from 'fs';

// Fixtures
const MOCK_YT_HTML = `
  <!DOCTYPE html>
  <html>
  <body>
    <script>
      var ytInitialPlayerResponse = {
        "videoDetails": {
          "videoId": "dQw4w9WgXcQ"
        },
        "captions": {
          "playerCaptionsTracklistRenderer": {
            "captionTracks": [
              {
                "baseUrl": "https://www.youtube.com/api/timedtext?v=dQw4w9WgXcQ&lang=en",
                "vssId": ".en",
                "languageCode": "en"
              },
              {
                "baseUrl": "https://www.youtube.com/api/timedtext?v=dQw4w9WgXcQ&lang=es",
                "vssId": ".es",
                "languageCode": "es"
              }
            ]
          }
        }
      };
    </script>
  </body>
  </html>
`;

const MOCK_CAPTION_XML = `
  <?xml version="1.0" encoding="utf-8" ?>
  <transcript>
    <text start="0.0" dur="2.0">Hello world</text>
    <text start="2.0" dur="1.5">Welcome to this video</text>
    <text start="3.5" dur="3.0">Enjoy learning typescript</text>
  </transcript>
`;

describe('extractTranscript() — Group A: Zod Input Validation', () => {
  it('A-1: rejects with a TranscriptError containing VALIDATION_ERROR when invalid URL format is passed', async () => {
    let error: any;
    try {
      await extractTranscript('not-a-url');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TranscriptError);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.cause).toBeInstanceOf(ZodError);
  });

  it('A-2: rejects when URL is valid but not a YouTube domain', async () => {
    let error: any;
    try {
      await extractTranscript('https://vimeo.com/123456');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TranscriptError);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('A-3: rejects when language_code contains invalid characters (Zod validates length/pattern)', async () => {
    let error: any;
    try {
      await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ', 'invalid language!!!');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TranscriptError);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('A-4: passes Zod validation and proceeds to fetch on short URL form', async () => {
    const mockFetch = jest.spyOn(global, 'fetch').mockImplementation((url: any) => {
      if (url.includes('timedtext')) {
        return Promise.resolve({
          text: () => Promise.resolve(MOCK_CAPTION_XML),
        } as any);
      }
      return Promise.resolve({
        text: () => Promise.resolve(MOCK_YT_HTML),
      } as any);
    });

    const res = await extractTranscript('https://youtu.be/dQw4w9WgXcQ');
    expect(res.video_id).toBe('dQw4w9WgXcQ');
    mockFetch.mockRestore();
  });
});

describe('extractTranscript() — Group B: Happy Path', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('B-1 to B-5: executes successfully and returns segments & joined text', async () => {
    mockFetch.mockImplementation((url: any) => {
      if (url.includes('timedtext')) {
        return Promise.resolve({
          text: () => Promise.resolve(MOCK_CAPTION_XML),
        } as any);
      }
      return Promise.resolve({
        text: () => Promise.resolve(MOCK_YT_HTML),
      } as any);
    });

    const res = await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ', 'en');

    // B-1: video_id extracted
    expect(res.video_id).toBe('dQw4w9WgXcQ');
    // B-2: correct count
    expect(res.segments.length).toBe(3);
    // B-3: segment text & timings are correct numbers (offset_ms and duration_ms)
    expect(res.segments[0]).toEqual({
      offset_ms: 0,
      duration_ms: 2000,
      text: 'Hello world',
    });
    expect(res.segments[1].offset_ms).toBe(2000);
    expect(res.segments[1].duration_ms).toBe(1500);
    // B-4: raw_text joined
    expect(res.raw_text).toBe('Hello world Welcome to this video Enjoy learning typescript');
    // B-5: fetch called exactly twice
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe('https://youtube.com/watch?v=dQw4w9WgXcQ');
    expect(mockFetch.mock.calls[1][0]).toBe('https://www.youtube.com/api/timedtext?v=dQw4w9WgXcQ&lang=en');
  });
});

describe('extractTranscript() — Group C: Language Code Filtering', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('C-1: requesting missing language code throws LANGUAGE_NOT_FOUND', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        text: () => Promise.resolve(MOCK_YT_HTML),
      } as any)
    );

    let error: any;
    try {
      await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ', 'fr');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TranscriptError);
    expect(error.code).toBe('LANGUAGE_NOT_FOUND');
  });

  it('C-2: requesting existing language code selects correct baseUrl', async () => {
    mockFetch.mockImplementation((url: any) => {
      if (url.includes('timedtext')) {
        return Promise.resolve({
          text: () => Promise.resolve('<transcript><text start="1" dur="1">Hola</text></transcript>'),
        } as any);
      }
      return Promise.resolve({
        text: () => Promise.resolve(MOCK_YT_HTML),
      } as any);
    });

    const res = await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ', 'es');
    expect(res.segments[0].text).toBe('Hola');
    expect(mockFetch.mock.calls[1][0]).toContain('lang=es');
  });

  it('C-3: omitting language code defaults to en', async () => {
    mockFetch.mockImplementation((url: any) => {
      if (url.includes('timedtext')) {
        return Promise.resolve({
          text: () => Promise.resolve(MOCK_CAPTION_XML),
        } as any);
      }
      return Promise.resolve({
        text: () => Promise.resolve(MOCK_YT_HTML),
      } as any);
    });

    await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ');
    expect(mockFetch.mock.calls[1][0]).toContain('lang=en');
  });
});

describe('extractTranscript() — Group D: Defensive / Error Branches', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('D-1: HTML response missing ytInitialPlayerResponse throws PLAYER_RESPONSE_NOT_FOUND', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        text: () => Promise.resolve('<html><body>No player response here</body></html>'),
      } as any)
    );

    let error: any;
    try {
      await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TranscriptError);
    expect(error.code).toBe('PLAYER_RESPONSE_NOT_FOUND');
  });

  it('D-2: JSON missing captions key throws CAPTIONS_NOT_AVAILABLE', async () => {
    const mockHtmlNoCaptions = `
      <script>
        var ytInitialPlayerResponse = {
          "videoDetails": { "videoId": "dQw4w9WgXcQ" }
        };
      </script>
    `;
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        text: () => Promise.resolve(mockHtmlNoCaptions),
      } as any)
    );

    let error: any;
    try {
      await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TranscriptError);
    expect(error.code).toBe('CAPTIONS_NOT_AVAILABLE');
  });

  it('D-3: Caption XML with zero text elements throws EMPTY_TRANSCRIPT', async () => {
    mockFetch.mockImplementation((url: any) => {
      if (url.includes('timedtext')) {
        return Promise.resolve({
          text: () => Promise.resolve('<transcript></transcript>'),
        } as any);
      }
      return Promise.resolve({
        text: () => Promise.resolve(MOCK_YT_HTML),
      } as any);
    });

    let error: any;
    try {
      await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TranscriptError);
    expect(error.code).toBe('EMPTY_TRANSCRIPT');
  });

  it('D-4: fetch() network failure propagates as FETCH_FAILED', async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error('DNS lookup failed')));

    let error: any;
    try {
      await extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TranscriptError);
    expect(error.code).toBe('FETCH_FAILED');
    expect(error.cause.message).toBe('DNS lookup failed');
  });
});

describe('Zero React Native Constraint', () => {
  it('verifies no React Native or Expo references in transcript skill package files', () => {
    const extractorCode = fs.readFileSync('D:/Quick_yt/apps/mobile/src/skills/transcript/extractor.ts', 'utf8');
    const validationCode = fs.readFileSync('D:/Quick_yt/apps/mobile/src/skills/transcript/validation.ts', 'utf8');
    const typesCode = fs.readFileSync('D:/Quick_yt/apps/mobile/src/skills/transcript/types.ts', 'utf8');

    const forbidden = ['react-native', 'expo-sqlite', 'expo-file-system', 'expo-print', 'expo-haptics', 'expo-updates', 'react'];

    forbidden.forEach(str => {
      expect(extractorCode).not.toContain(`"${str}"`);
      expect(extractorCode).not.toContain(`'${str}'`);
      expect(validationCode).not.toContain(`"${str}"`);
      expect(validationCode).not.toContain(`'${str}'`);
      expect(typesCode).not.toContain(`"${str}"`);
      expect(typesCode).not.toContain(`'${str}'`);
    });
  });
});
