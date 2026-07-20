import { generateVisualReport } from '../../src/skills/vision/geminiVision';
import { GeminiVisionRequestSchema } from '../../src/skills/vision/validation';

describe('Gemini Vision Service', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('rejects multimodal request payloads missing base64 image data', () => {
    const invalidPayload = {
      contents: [
        {
          role: 'user' as const,
          parts: [
            { text: 'Describe these slides.' },
            { inlineData: { mimeType: 'image/jpeg' as const, data: '' } }, // Empty base64 data
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: 'Analyze slides.' }],
      },
    };
    expect(GeminiVisionRequestSchema.safeParse(invalidPayload).success).toBe(false);
  });

  it('rejects multimodal request payloads carrying invalid mimetypes', () => {
    const invalidPayload = {
      contents: [
        {
          role: 'user' as const,
          parts: [
            { text: 'Describe these slides.' },
            { inlineData: { mimeType: 'image/gif' as any, data: 'SGVsbG8=' } }, // invalid mimeType
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: 'Analyze slides.' }],
      },
    };
    expect(GeminiVisionRequestSchema.safeParse(invalidPayload).success).toBe(false);
  });

  it('validates correct multimodal payloads successfully', () => {
    const validPayload = {
      contents: [
        {
          role: 'user' as const,
          parts: [
            { text: 'Describe these slides.' },
            { inlineData: { mimeType: 'image/jpeg' as const, data: 'SGVsbG8=' } },
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: 'Analyze slides.' }],
      },
    };
    expect(GeminiVisionRequestSchema.safeParse(validPayload).success).toBe(true);
  });

  it('sends correct multimodal fetch request and returns generated report', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'Visual report markdown content' }],
              },
            },
          ],
        }),
    } as any);

    const images: { mimeType: 'image/jpeg' | 'image/png'; data: string }[] = [
      { mimeType: 'image/jpeg', data: 'SGVsbG8=' },
    ];

    const report = await generateVisualReport(images, 'VALID_API_KEY');

    expect(report).toBe('Visual report markdown content');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('v1beta/models/gemini-3.5-flash:generateContent');
    expect(options.method).toBe('POST');
    expect(options.headers['x-goog-api-key']).toBe('VALID_API_KEY');

    const body = JSON.parse(options.body);
    expect(body.contents[0].parts[1].inlineData.data).toBe('SGVsbG8=');
    expect(body.contents[0].parts[1].inlineData.mimeType).toBe('image/jpeg');
    expect(body.systemInstruction.parts[0].text).toContain('visual analysis');
  });

  it('throws on non-200 API response status code', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('Invalid request fields'),
    } as any);

    const images: { mimeType: 'image/jpeg' | 'image/png'; data: string }[] = [
      { mimeType: 'image/png', data: 'SGVsbG8=' },
    ];

    await expect(generateVisualReport(images, 'API_KEY')).rejects.toThrow(
      'Gemini Vision API returned status 400: Bad Request - Invalid request fields'
    );
  });
});
