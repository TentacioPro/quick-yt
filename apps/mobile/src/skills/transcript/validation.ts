import { z } from 'zod';

export const TranscriptInputSchema = z.object({
  youtube_url: z.string().url().regex(/youtube\.com|youtu\.be/),
  language_code: z.string().regex(/^[a-zA-Z-]{2,5}$/).default('en'),
});

export type TranscriptInput = z.infer<typeof TranscriptInputSchema>;
