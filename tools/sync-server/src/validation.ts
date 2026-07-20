import { z } from 'zod';

export const UploadFileSchema = z.object({
  originalname: z.string().endsWith('.db'),
  mimetype: z.enum([
    'application/octet-stream',
    'application/x-sqlite3',
    'application/vnd.sqlite3',
  ]),
});

export type UploadFile = z.infer<typeof UploadFileSchema>;

export const MetricItemSchema = z.object({
  id: z.string().min(1),
  action: z.string().min(1),
  entityId: z.string().nullable().optional(),
  performanceMs: z.number().nullable().optional(),
  timestamp: z.number().positive(),
  status: z.string().nullable().optional(),
});

export const MetricsPayloadSchema = z.array(MetricItemSchema);

export type MetricsPayload = z.infer<typeof MetricsPayloadSchema>;
