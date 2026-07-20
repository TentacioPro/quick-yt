import { extractTranscript } from './transcript/extractor';
import { generateReport } from './gemini/geminiService';
import { generatePdf } from './pdf/pdfGenerator';
import { getDrizzleDb } from '../db/client';
import { videos } from '../db/schema';
import { withAuditCatch } from '../db/withAuditCatch';
import { useToastStore } from '../store/useToastStore';
import { eq } from 'drizzle-orm';

export async function processVideoPipeline(
  videoId: string,
  youtubeUrl: string,
  languageCode: string,
  apiKey: string
): Promise<void> {
  const db = getDrizzleDb();

  try {
    // 1. Start extraction - update status to 'transcribing'
    await withAuditCatch('PIPELINE_INIT_TRANSCRIPTION', videoId, async () => {
      await db
        .update(videos)
        .set({ status: 'transcribing' })
        .where(eq(videos.id, videoId));
    });

    const transcriptResult = await withAuditCatch(
      'PIPELINE_EXTRACT_TRANSCRIPT',
      videoId,
      async () => {
        return await extractTranscript(youtubeUrl, languageCode);
      }
    );

    // Save transcript & transition to 'processing'
    await withAuditCatch('PIPELINE_SAVE_TRANSCRIPT', videoId, async () => {
      await db
        .update(videos)
        .set({
          transcriptRaw: transcriptResult.raw_text,
          status: 'processing',
        })
        .where(eq(videos.id, videoId));
    });

    // 2. Gemini report generation
    const markdownReport = await withAuditCatch(
      'PIPELINE_GENERATE_REPORT',
      videoId,
      async () => {
        return await generateReport(transcriptResult.raw_text, apiKey);
      }
    );

    // Save report & transition to 'generating_pdf'
    await withAuditCatch('PIPELINE_SAVE_REPORT', videoId, async () => {
      await db
        .update(videos)
        .set({
          markdownReport: markdownReport,
          status: 'generating_pdf',
        })
        .where(eq(videos.id, videoId));
    });

    // 3. Generate PDF document
    const pdfUri = await withAuditCatch(
      'PIPELINE_GENERATE_PDF',
      videoId,
      async () => {
        return await generatePdf(markdownReport);
      }
    );

    // Update status to 'complete'
    await withAuditCatch('PIPELINE_COMPLETE', videoId, async () => {
      await db
        .update(videos)
        .set({
          status: 'complete',
        })
        .where(eq(videos.id, videoId));
    });

    // Pipeline Success Toast (v2 rule)
    useToastStore.getState().show('Report generated', 'success');
  } catch (error) {
    // Write failed status to DB
    try {
      await db
        .update(videos)
        .set({ status: 'failed' })
        .where(eq(videos.id, videoId));
    } catch (_) {}

    // Pipeline Failure Toast (v2 rule)
    const errMessage = (error as Error).message || 'Unknown error occurred';
    useToastStore.getState().show(`Pipeline failed: ${errMessage}`, 'error');

    // Re-throw so caller knows it failed
    throw error;
  }
}
