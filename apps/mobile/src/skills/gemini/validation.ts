import { z } from 'zod';

export const GeminiRequestSchema = z.object({
  contents: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.array(
        z.object({
          text: z.string().min(1),
        })
      ),
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

export type GeminiRequest = z.infer<typeof GeminiRequestSchema>;
