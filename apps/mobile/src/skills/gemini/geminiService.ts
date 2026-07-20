import { GeminiRequestSchema } from './validation';

export async function generateReport(
  rawText: string,
  apiKey: string
): Promise<string> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Raw text cannot be empty');
  }

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API key cannot be empty');
  }

  const systemInstructionText =
    'You are a technical analyst. You will be provided with a raw transcript from a video. Your task is to generate a comprehensive, highly detailed Markdown report. You must not summarize away crucial technical details. Use proper headers, lists, and code blocks if applicable. Ground your entire response strictly in the provided transcript. Do not hallucinate external information.';

  const requestPayload = {
    contents: [
      {
        role: 'user' as const,
        parts: [
          {
            text: `Here is the raw transcript:\n\n${rawText}`,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [
        {
          text: systemInstructionText,
        },
      ],
    },
  };

  // Perform validation prior to outbound call (v2 validation rule)
  GeminiRequestSchema.parse(requestPayload);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestPayload),
    });
  } catch (err) {
    throw new Error(`Gemini service request failed: ${(err as Error).message}`);
  }

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (_) {}
    throw new Error(
      `Gemini API returned status ${response.status}: ${response.statusText}${
        errorText ? ` - ${errorText}` : ''
      }`
    );
  }

  const responseJson = await response.json();
  const textResult = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResult) {
    throw new Error('Gemini API response structure did not contain generated text.');
  }

  return textResult;
}
