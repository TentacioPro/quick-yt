# 03 — YouTube Transcript Skill (Pure TypeScript Extractor)

## GOAL
Deliver a fully portable, zero-React-Native TypeScript module under `apps/mobile/src/skills/transcript/` that:
1. Validates its input payload strictly via Zod (URL format + language code) before any network call.
2. Fetches raw YouTube HTML, extracts the embedded `ytInitialPlayerResponse` JSON, locates the caption track for the requested language, fetches the XML caption file, and parses it into timestamped segments.
3. Returns a typed `TranscriptResult` (`video_id`, `raw_text`, `segments[]`).
4. Passes a fully mocked Jest test suite with defensive assertions covering the happy path, Zod rejections, and all error branches (missing captions, bad HTML, non-YouTube URL).

The module **must contain zero imports** from `react-native`, `expo-*`, or any device-only package. It must be droppable into any Node.js or edge runtime without modification.

## MODULE SPECS IN SCOPE
- `specs/modules/validation-guardrails.spec.md` — Zod schema shapes, input validation rules, error taxonomy.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Skill spec — execution logic | `03_YouTube_Transcript_Skill.md` (L14–L29) | 6-step extraction algorithm is the canonical implementation contract. |
| Input/Output payload shapes | `03_YouTube_Transcript_Skill.md` (L7–L29) | `types.ts` must match these JSON shapes exactly. |
| Zod validation rule | `plan.md` § Phase 3 (L231–L237) | `TranscriptInputSchema` exact definition reproduced in `validation.ts`. |
| jest.setup.js mock stubs | `apps/mobile/jest.setup.js` | Global `expo-sqlite`, `expo-file-system` mocks already wired — no changes needed. |
| withAuditCatch HOF | `apps/mobile/src/db/withAuditCatch.ts` | **Not used inside extractor.ts** — extractor is pure and has no DB dependency. Caller (pipeline.ts, Task 04) wraps the extraction call. |
| Task 02 test suite | `apps/mobile/__tests__/db/` | Must remain 18/18 green throughout (regression gate). |

## FILE SCOPE
Only the following files may be created or modified by this task:

```text
apps/mobile/src/skills/transcript/types.ts        (create)
apps/mobile/src/skills/transcript/validation.ts   (create)
apps/mobile/src/skills/transcript/extractor.ts    (create)
apps/mobile/__tests__/skills/transcript.test.ts   (create)
specs/modules/validation-guardrails.spec.md        (update)
specs/tasks/03-transcript-skill-decisions.md       (create)
specs/tasks/03-transcript-skill.state.md           (update)
```

No other files may be touched. `jest.setup.js`, `jest.config.js`, `schema.ts`, `audit.ts` are locked.

## ZERO REACT NATIVE CONSTRAINT
The following imports are **strictly forbidden** inside `types.ts`, `validation.ts`, and `extractor.ts`:

```
react-native
expo-sqlite
expo-file-system
expo-print
expo-haptics
expo-updates
react
```

The test suite must include a static import audit assertion that confirms none of these strings appear in the extractor source.

## TDD CONTRACT

### 1. New Suite — `__tests__/skills/transcript.test.ts`

Write ALL assertions below FIRST. Every test must fail on empty/stub implementation.

#### Group A — Zod Input Validation (must fail before fetch is even called)

| # | Assertion |
|---|---|
| A-1 | `extractTranscript('not-a-url')` rejects with a `ZodError` (or a typed wrapper containing Zod's message). |
| A-2 | `extractTranscript('https://vimeo.com/123456')` rejects — URL is valid but not a YouTube domain. |
| A-3 | `extractTranscript('https://youtube.com/watch?v=dQw4w9WgXcQ', 'invalid language!!!')` — accepts gracefully OR rejects with a Zod message, depending on the implemented language_code constraint (document the decision). |
| A-4 | `extractTranscript('https://youtu.be/dQw4w9WgXcQ')` passes Zod validation (short URL form). |

#### Group B — Happy Path (mocked `global.fetch`)

Fixture data required (defined inside the test file as constants):
- `MOCK_YT_HTML` — a minimal HTML string containing `var ytInitialPlayerResponse = {...};` with:
  - `captions.playerCaptionsTracklistRenderer.captionTracks` array containing at least one entry with `languageCode: 'en'` and a `baseUrl`.
  - `videoDetails.videoId: 'dQw4w9WgXcQ'`
- `MOCK_CAPTION_XML` — a minimal TimedText XML string with 2–3 `<text>` elements containing `start`, `dur`, and text content.

| # | Assertion |
|---|---|
| B-1 | Returns `video_id: 'dQw4w9WgXcQ'` extracted from `ytInitialPlayerResponse.videoDetails.videoId`. |
| B-2 | Returns `segments` array with the correct count matching the XML fixture (e.g. 3 segments). |
| B-3 | Each segment has `offset_ms` (number), `duration_ms` (number), `text` (string) — all non-empty/non-NaN. |
| B-4 | `raw_text` is a single string formed by joining all segment texts (whitespace-trimmed, non-empty). |
| B-5 | `fetch` is called exactly **twice** — once for the YouTube HTML page, once for the caption XML `baseUrl`. |

#### Group C — Language Code Filtering

| # | Assertion |
|---|---|
| C-1 | Requesting `languageCode: 'fr'` when only `'en'` track exists throws a `TranscriptError` with code `LANGUAGE_NOT_FOUND`. |
| C-2 | Requesting `languageCode: 'en'` selects the correct track's `baseUrl`. |
| C-3 | Omitting `languageCode` defaults to `'en'` and successfully extracts. |

#### Group D — Defensive / Error Branches

| # | Assertion |
|---|---|
| D-1 | HTML response that does not contain `ytInitialPlayerResponse` throws `TranscriptError` with code `PLAYER_RESPONSE_NOT_FOUND`. |
| D-2 | `ytInitialPlayerResponse` JSON that has no `captions` key throws `TranscriptError` with code `CAPTIONS_NOT_AVAILABLE`. |
| D-3 | Caption XML with zero `<text>` elements throws `TranscriptError` with code `EMPTY_TRANSCRIPT`. |
| D-4 | `fetch()` network failure (rejected promise) propagates as a `TranscriptError` with code `FETCH_FAILED` wrapping the original error. |

### 2. Regression Assertions
- `__tests__/db/schema.test.ts` — 5/5 green.
- `__tests__/db/audit.test.ts` — 5/5 green.
- `__tests__/db/withAuditCatch.test.ts` — 5/5 green.
- `__tests__/store/useToastStore.test.ts` — 3/3 green.
- **Total prior suite: 18/18 must remain green.**

## TYPED ERROR CONTRACT

`extractor.ts` must export a `TranscriptError` class:

```typescript
export class TranscriptError extends Error {
  constructor(
    public readonly code: TranscriptErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'TranscriptError';
  }
}

export type TranscriptErrorCode =
  | 'VALIDATION_ERROR'
  | 'FETCH_FAILED'
  | 'PLAYER_RESPONSE_NOT_FOUND'
  | 'CAPTIONS_NOT_AVAILABLE'
  | 'LANGUAGE_NOT_FOUND'
  | 'EMPTY_TRANSCRIPT';
```

All thrown errors from `extractor.ts` must be `TranscriptError` instances — no bare `throw new Error(...)`.

## IMPLEMENTATION ALGORITHM (for extractor.ts)

Follows `03_YouTube_Transcript_Skill.md` execution logic exactly:

```
Step 0  →  Validate input via TranscriptInputSchema.parse()
Step 1  →  fetch(youtube_url) → HTML string
           └─ catch → throw TranscriptError('FETCH_FAILED', ..., cause)
Step 2  →  regex match ytInitialPlayerResponse JSON from HTML
           └─ not found → throw TranscriptError('PLAYER_RESPONSE_NOT_FOUND', ...)
Step 3  →  JSON.parse() → navigate to captionTracks[]
           └─ missing → throw TranscriptError('CAPTIONS_NOT_AVAILABLE', ...)
Step 4  →  find track where languageCode matches (default 'en')
           └─ not found → throw TranscriptError('LANGUAGE_NOT_FOUND', ...)
Step 5  →  fetch(baseUrl) → XML string
           └─ catch → throw TranscriptError('FETCH_FAILED', ..., cause)
Step 6  →  parse XML <text> elements → segments[]
           └─ empty → throw TranscriptError('EMPTY_TRANSCRIPT', ...)
Step 7  →  join segment texts → raw_text
Step 8  →  return TranscriptResult
```

## OUT OF SCOPE
- No database writes. `extractor.ts` has no knowledge of SQLite or Drizzle.
- No `withAuditCatch` inside extractor — the caller (Task 04 pipeline) wraps it.
- No Gemini API calls. Those are Task 04.
- No PDF generation. Task 04.
- No UI components or Zustand store references.
- No `jest.setup.js` or `jest.config.js` changes.

## DONE MEANS
- [ ] All transcript test assertions (A-1 → D-4, minimum 15 assertions) pass with zero failures.
- [ ] Prior 18/18 test suite remains green (full regression run).
- [ ] `extractor.ts`, `types.ts`, `validation.ts` contain **zero** imports from RN/Expo packages (verified by grep or test assertion).
- [ ] All thrown errors are `TranscriptError` instances with a typed `code`.
- [ ] `03-transcript-skill-decisions.md` written with trade-off rationale.
- [ ] `specs/modules/validation-guardrails.spec.md` updated with transcript Zod schema.
- [ ] Terminal test summary pasted to state file.
