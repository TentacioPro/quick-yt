# YouTube Transcript Extractor & AI Pipeline

## 1. Portable Skill Definition (OKF Format)
The transcript extractor must remain decoupled from the React Native environment. It acts as an independent utility capable of being dropped into any Node or edge environment.

**Skill Name:** `extract_youtube_transcript`
**Input Payload:**
```json
{
  "youtube_url": "string",
  "language_code": "string (default: 'en')"
}
```
**Execution Logic:**
1. Fetch the raw HTML of the provided YouTube URL.
2. Parse the HTML to locate `ytInitialPlayerResponse`.
3. Extract `captions.playerCaptionsTracklistRenderer.captionTracks`.
4. Fetch the XML/JSON from the `baseUrl` of the matched language code.
5. Parse the timestamps and text into a structured array.

**Output Payload:**
```json
{
  "video_id": "string",
  "raw_text": "string",
  "segments": [
    { "offset_ms": 0, "duration_ms": 2000, "text": "string" }
  ]
}
```

## 2. Gemini 1.5 Pro Processing Pipeline
The parsed `raw_text` is passed to the Gemini API.

**System Instruction:**
"You are a technical analyst. You will be provided with a raw transcript from a video. Your task is to generate a comprehensive, highly detailed Markdown report. You must not summarize away crucial technical details. Use proper headers, lists, and code blocks if applicable. Ground your entire response strictly in the provided transcript. Do not hallucinate external information."

**Output Stages:**
1. **Markdown Generation:** Saved to SQLite `videos.markdownReport`.
2. **PDF Generation:** 
   - Parse Markdown to HTML via `markdown-it`.
   - Apply a Material 3 inspired CSS stylesheet (injected into the HTML string).
   - Execute `expo-print.printToFileAsync({ html })`.
   - Store the resulting URI in the local database.
