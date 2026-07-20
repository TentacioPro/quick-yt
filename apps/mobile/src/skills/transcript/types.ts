export interface TranscriptSegment {
  offset_ms: number;
  duration_ms: number;
  text: string;
}

export interface TranscriptResult {
  video_id: string;
  raw_text: string;
  segments: TranscriptSegment[];
}
