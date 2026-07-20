import { GeminiVisionRequestSchema } from './validation';

export async function generateVisualReport(
  images: { mimeType: 'image/jpeg' | 'image/png'; data: string }[],
  apiKey: string
): Promise<string> {
  if (!images || images.length === 0) {
    throw new Error('Images list cannot be empty');
  }

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API key cannot be empty');
  }

  const systemInstructionText =
    'You are a technical analyst specializing in visual analysis. You will be provided with keyframe screenshots/slides from a video. Your task is to analyze these images and extract structural diagrams, architectural notes, and visual content, then compile them into a detailed Markdown report. Do not hallucinate external details.';

  const parts: any[] = [
    {
      text: 'Analyze these visual slides and compile a structured architectural markdown report.',
    },
  ];

  images.forEach((img) => {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data,
      },
    });
  });

  const requestPayload = {
    contents: [
      {
        role: 'user' as const,
        parts,
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
  GeminiVisionRequestSchema.parse(requestPayload);

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
    throw new Error(`Gemini Vision service request failed: ${(err as Error).message}`);
  }

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (_) {}
    throw new Error(
      `Gemini Vision API returned status ${response.status}: ${response.statusText}${
        errorText ? ` - ${errorText}` : ''
      }`
    );
  }

  const responseJson = await response.json();
  const textResult = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResult) {
    throw new Error('Gemini Vision API response structure did not contain generated text.');
  }

  return textResult;
}
