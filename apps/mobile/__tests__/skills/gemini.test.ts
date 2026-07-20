import { generateReport } from '../../src/skills/gemini/geminiService';
import { GeminiRequestSchema } from '../../src/skills/gemini/validation';
import { ZodError } from 'zod';

describe('generateReport()', () => {
  let mockFetch: jest.SpyInstance;

  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    mockFetch.mockRestore();
  });

  it('rejects empty raw_text', async () => {
    await expect(generateReport('', 'valid_api_key')).rejects.toThrow();
  });

  it('rejects empty apiKey', async () => {
    await expect(generateReport('Valid text content', '')).rejects.toThrow();
  });

  it('validates outbound request shape conforms to GeminiRequestSchema', () => {
    const validPayload = {
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: 'Please process this transcript.' }],
        },
      ],
      systemInstruction: {
        parts: [{ text: 'You are a technical analyst.' }],
      },
    };
    expect(GeminiRequestSchema.safeParse(validPayload).success).toBe(true);

    const invalidPayloadEmptyText = {
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: '' }],
        },
      ],
      systemInstruction: {
        parts: [{ text: 'You are a technical analyst.' }],
      },
    };
    expect(GeminiRequestSchema.safeParse(invalidPayloadEmptyText).success).toBe(false);
  });

  it('sends post request to Gemini API and returns report text', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'Generated markdown report content' }],
              },
            },
          ],
        }),
    } as any);

    const report = await generateReport('Raw transcript contents', 'MOCK_API_KEY');
    expect(report).toBe('Generated markdown report content');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('v1beta/models/gemini-3.5-flash:generateContent');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['x-goog-api-key']).toBe('MOCK_API_KEY');

    const body = JSON.parse(options.body);
    expect(body.contents[0].parts[0].text).toContain('Raw transcript contents');
    expect(body.systemInstruction.parts[0].text).toContain('technical analyst');
  });

  it('throws when Gemini API returns non-200 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: () => Promise.resolve('Invalid API key'),
    } as any);

    await expect(generateReport('Transcript data', 'BAD_KEY')).rejects.toThrow(
      'Gemini API returned status 403: Forbidden - Invalid API key'
    );
  });
});
