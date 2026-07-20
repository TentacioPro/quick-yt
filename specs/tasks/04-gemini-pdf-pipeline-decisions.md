# 04-gemini-pdf-pipeline — Decisions

## Decision Log

### D-01 · Zod Request Validation prior to API invocation
- **Context:** Calling external APIs with incorrect formats wastes resources and produces hard-to-debug failures. Gemini 1.5 Pro expects a structured JSON request payload containing role and part tags.
- **Decision:** Implemented `GeminiRequestSchema` in Zod and enforced `GeminiRequestSchema.parse(requestPayload)` directly inside `geminiService.ts` before the HTTP post is dispatched. This guarantees that malformed request payloads are caught locally rather than failing over network.
- **Rejected path:** Validating parameters separately. Safe-parsing inside the caller was rejected in favor of full schema parsing directly inside `geminiService.ts` to keep concerns encapsulated.

---

### D-02 · Sequential Status Progression (Lifecycle)
- **Context:** A processing video transitions through multiple async steps. If the app crashes or reloads, we need to know exactly which stage it was on.
- **Decision:** Wired a sequential set of database updates updating `videos.status` through:
  `pending` → `transcribing` → `processing` → `generating_pdf` → `complete`
  And mapped a catch-all block setting `status` to `failed` on pipeline errors.
- **Rejected path:** A single status change from `pending` to `complete`. Rejected because it lacks granularity for UI loaders.

---

### D-03 · `withAuditCatch` Decoration at every pipeline boundary
- **Context:** Autopilot contracts require comprehensive logging of every database update, network call, and processing stage.
- **Decision:** Every asynchronous segment of the pipeline (including DB saves and sub-service calls) is wrapped inside `withAuditCatch(...)`. This guarantees detailed audit traces containing execution time metrics for analysis.

---

## Terminal Evidence

```
> pnpm --filter mobile test -- --coverage --verbose

PASS __tests__/skills/pipeline.test.ts (3 tests)
PASS __tests__/skills/gemini.test.ts (5 tests)
PASS __tests__/skills/pdf.test.ts (2 tests)
...
Test Suites: 8 passed, 8 total
Tests:       41 passed, 41 total
Snapshots:   0 total
Time:        2.718 s
```
