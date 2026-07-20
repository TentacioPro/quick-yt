import { z } from 'zod';

export const GeminiVisionRequestSchema = z.object({
  contents: z.array(
    z.object({
      role: z.enum(['user']),
      parts: z.array(
        z.union([
          z.object({
            text: z.string().min(1),
          }),
          z.object({
            inlineData: z.object({
              mimeType: z.enum(['image/jpeg', 'image/png']),
              data: z.string().min(1), // Base64 data
            }),
          }),
        ])
      ).min(1),
    })
  ).min(1),
  systemInstruction: z.object({
    parts: z.array(
      z.object({
        text: z.string().min(1),
      })
    ),
  }),
});

export type GeminiVisionRequest = z.infer<typeof GeminiVisionRequestSchema>;
