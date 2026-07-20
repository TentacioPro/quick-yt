# 03-transcript-skill — Decisions

## Decision Log

### D-01 · Portable XML Caption Parsing via Regex instead of NPM packages
- **Context:** Node.js XML parsers like `fast-xml-parser` or browser DOM parsers like `DOMParser` are either heavy or environment-specific. Our skill needs to remain fully portable, lightweight, and zero-dependency (other than `zod`).
- **Decision:** Used a focused Regular Expression to match `<text>` tags and extract `start`, `dur` and the inner text content:
  `/<text\s+start="([^"]*)"(?:\s+dur="([^"]*)")?[^>]*>([^<]*)<\/text>/g`
  This is extremely fast, works in any JavaScript engine (React Native, Node.js, Cloudflare Workers), and has zero dependency footprint.
- **Rejected path:** Installing `fast-xml-parser` or `xml2js`. Rejected because it introduces bundle overhead and potential native code linking issues on React Native.

---

### D-02 · Custom `TranscriptError` with Typed Error Codes
- **Context:** Autopilot and error guardrail requirements mandate standardized error response shapes. Bare JavaScript `Error` objects do not carry machine-readable categorization.
- **Decision:** Implemented a custom `TranscriptError` class extending `Error` with a strictly typed `code` property (`VALIDATION_ERROR`, `FETCH_FAILED`, `PLAYER_RESPONSE_NOT_FOUND`, etc.). Added prototype chain restoration:
  `Object.setPrototypeOf(this, TranscriptError.prototype)`
  to ensure `instanceof TranscriptError` works reliably across all ES/Babel compiled modules.

---

### D-03 · Language Code Regex Limit in Zod
- **Context:** Language codes should be validated defensively to prevent security vulnerabilities or injection attacks during query formulation (e.g. passing very long strings or scripts in the language parameter).
- **Decision:** Locked Zod schema for `language_code` to only permit valid 2-to-5 character language identifier formats (e.g. `en`, `es`, `zh-CN` etc.):
  `z.string().regex(/^[a-zA-Z-]{2,5}$/).default('en')`
  This correctly intercepts malformed language inputs before reaching the HTTP fetch layer.

---

### D-04 · HTML Entity Decoder in Extractor
- **Context:** YouTube caption tracks store text HTML-encoded (e.g. `&amp;` instead of `&`). Returning raw encoded strings to downstream LLM / processing pipelines degrades output quality.
- **Decision:** Built a pure-JS entity decoder function mapping common XML entities:
  `&amp;` -> `&`, `&lt;` -> `<`, `&gt;` -> `>`, `&quot;` -> `"`, `&#39;` / `&apos;` -> `'`
  This ensures the transcript text is clean, readable, and properly formatted without introducing an external HTML decoding package.

---

## Terminal Evidence

```
> pnpm --filter mobile test -- --coverage --verbose

PASS __tests__/skills/transcript.test.ts (13 tests)
PASS __tests__/store/useToastStore.test.ts (3 tests)
PASS __tests__/db/withAuditCatch.test.ts (5 tests)
PASS __tests__/db/audit.test.ts (5 tests)
PASS __tests__/db/schema.test.ts (5 tests)

Test Suites: 5 passed, 5 total
Tests:       31 passed, 31 total
Snapshots:   0 total
Time:        2.234 s
Ran all test suites.
```
