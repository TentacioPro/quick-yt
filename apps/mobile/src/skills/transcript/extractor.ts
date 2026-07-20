import { TranscriptResult, TranscriptSegment } from './types';
import { TranscriptInputSchema } from './validation';
import { ZodError } from 'zod';

export type TranscriptErrorCode =
  | 'VALIDATION_ERROR'
  | 'FETCH_FAILED'
  | 'PLAYER_RESPONSE_NOT_FOUND'
  | 'CAPTIONS_NOT_AVAILABLE'
  | 'LANGUAGE_NOT_FOUND'
  | 'EMPTY_TRANSCRIPT';

export class TranscriptError extends Error {
  constructor(
    public readonly code: TranscriptErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'TranscriptError';
    // Restore prototype chain
    Object.setPrototypeOf(this, TranscriptError.prototype);
  }
}

// Simple HTML entity decoder
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export async function extractTranscript(
  youtubeUrl: string,
  languageCode: string = 'en'
): Promise<TranscriptResult> {
  // Step 0: Zod validation
  const validationResult = TranscriptInputSchema.safeParse({
    youtube_url: youtubeUrl,
    language_code: languageCode,
  });

  if (!validationResult.success) {
    throw new TranscriptError(
      'VALIDATION_ERROR',
      'Invalid URL or language code format',
      validationResult.error
    );
  }

  // Step 1: Fetch raw HTML
  let htmlContent: string;
  try {
    const response = await fetch(youtubeUrl);
    htmlContent = await response.text();
  } catch (error) {
    throw new TranscriptError(
      'FETCH_FAILED',
      `Failed to fetch YouTube page: ${(error as Error).message}`,
      error
    );
  }

  // Step 2: Parse ytInitialPlayerResponse
  const playerResponseRegex = /ytInitialPlayerResponse\s*=\s*({.+?});/s;
  const match = htmlContent.match(playerResponseRegex);
  if (!match) {
    throw new TranscriptError(
      'PLAYER_RESPONSE_NOT_FOUND',
      'Could not find ytInitialPlayerResponse in the YouTube page HTML.'
    );
  }

  let playerResponse: any;
  try {
    playerResponse = JSON.parse(match[1]);
  } catch (error) {
    throw new TranscriptError(
      'PLAYER_RESPONSE_NOT_FOUND',
      'Failed to parse ytInitialPlayerResponse JSON.',
      error
    );
  }

  // Extract video ID safely
  const videoId = playerResponse.videoDetails?.videoId;
  if (!videoId) {
    throw new TranscriptError(
      'PLAYER_RESPONSE_NOT_FOUND',
      'Video details or video ID missing from player response.'
    );
  }

  // Step 3: Extract caption tracks
  const captionTracks =
    playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!captionTracks || !Array.isArray(captionTracks) || captionTracks.length === 0) {
    throw new TranscriptError(
      'CAPTIONS_NOT_AVAILABLE',
      'No caption tracks are available for this video.'
    );
  }

  // Step 4: Find matched language track
  const matchedTrack = captionTracks.find(
    (track: any) => track.languageCode === languageCode
  );

  if (!matchedTrack || !matchedTrack.baseUrl) {
    throw new TranscriptError(
      'LANGUAGE_NOT_FOUND',
      `Caption track for language '${languageCode}' was not found.`
    );
  }

  // Step 5: Fetch XML captions
  let xmlContent: string;
  try {
    const response = await fetch(matchedTrack.baseUrl);
    xmlContent = await response.text();
  } catch (error) {
    throw new TranscriptError(
      'FETCH_FAILED',
      `Failed to fetch caption tracks from URL: ${(error as Error).message}`,
      error
    );
  }

  // Step 6 & 7: Parse XML into segments
  const segments: TranscriptSegment[] = [];
  const textRegex = /<text\s+start="([^"]*)"(?:\s+dur="([^"]*)")?[^>]*>([^<]*)<\/text>/g;
  let textMatch;
  while ((textMatch = textRegex.exec(xmlContent)) !== null) {
    const startSec = parseFloat(textMatch[1]);
    const durSec = textMatch[2] ? parseFloat(textMatch[2]) : 0;
    const text = decodeHtmlEntities(textMatch[3].trim());

    segments.push({
      offset_ms: Math.round(startSec * 1000),
      duration_ms: Math.round(durSec * 1000),
      text,
    });
  }

  if (segments.length === 0) {
    throw new TranscriptError(
      'EMPTY_TRANSCRIPT',
      'The caption track contains no parsed text segments.'
    );
  }

  const rawText = segments.map((s) => s.text).join(' ');

  // Step 8: Return result
  return {
    video_id: videoId,
    raw_text: rawText,
    segments,
  };
}
