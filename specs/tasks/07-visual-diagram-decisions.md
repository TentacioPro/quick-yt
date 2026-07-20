# 07-visual-diagram — Decisions

## Decision Log

### D-01 · Multimodal inlineData Payload Structure
- **Context:** Gemini API accepts image payloads structured as `inlineData` parts containing a `mimeType` and a base64-encoded `data` string. Sending image urls or multi-part form payloads is either not supported natively or slower.
- **Decision:** Structured `generateVisualReport` parameters to take a list of `{ mimeType: 'image/jpeg' | 'image/png', data: string }` and map them directly to Gemini's inlineData payload parts:
  ```json
  {
    "inlineData": {
      "mimeType": "image/jpeg",
      "data": "..."
    }
  }
  ```
  This is fully supported in Gemini v1beta, lightweight, and completely portable.

---

### D-02 · Multimodal MIME Guardrails in Zod
- **Context:** Gemini API multimodal endpoints only support specific image and video MIME types. Permitting formats like `.gif` or `.bmp` to propagate to the endpoint will cause API failures and consume network resources needlessly.
- **Decision:** Validated multimodal parts using a strict Zod enum constraint:
  `z.enum(['image/jpeg', 'image/png'])`
  This throws local Zod errors on invalid types, preventing raw requests from firing.

---

## Terminal Evidence

```
# Mobile tests
PASS __tests__/skills/vision.test.ts
  Gemini Vision Service
    √ rejects multimodal request payloads missing base64 image data (156 ms)
    √ rejects multimodal request payloads carrying invalid mimetypes (1 ms)
    √ validates correct multimodal payloads successfully (1 ms)
    √ sends correct multimodal fetch request and returns generated report (2 ms)
    √ throws on non-200 API response status code (4 ms)

Test Suites: 11 passed, 11 total
Tests:       59 passed, 59 total
Snapshots:   0 total
Time:        3.366 s
Ran all test suites.
```
