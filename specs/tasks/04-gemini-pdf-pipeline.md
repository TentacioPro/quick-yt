# 04 — Gemini Pipeline + PDF Generation

## GOAL
Implement the Gemini API integration service, the native PDF generator using `expo-print` + `markdown-it` with Material 3 styling, and the master processing orchestrator pipeline (`pipeline.ts`). The orchestrator must run through the database-driven status lifecycle, validate request payloads via Zod, write execution steps to the audit logs via `withAuditCatch`, and trigger toast notifications (coupled with haptics) on success or failure.

## MODULE SPECS IN SCOPE
- `specs/modules/db-layer.spec.md` — SQLite status fields and audit wrap requirements.
- `specs/modules/validation-guardrails.spec.md` — Zod request validation details.
- `specs/modules/ui-ux.spec.md` — Toast alerts & haptic responses.
- `specs/modules/error-contract.spec.md` — Try/catch flow and logs.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Transcript extractor | `apps/mobile/src/skills/transcript/` | Extractor called in stage 1 of the pipeline. |
| Drizzle schema & DB client | `apps/mobile/src/db/` | Status transitions and Markdown reports written to SQLite database. |
| useToastStore | `apps/mobile/src/store/useToastStore.ts` | Snackbar notification triggered on success/fail. |
| withAuditCatch | `apps/mobile/src/db/withAuditCatch.ts` | All pipeline operations wrapped in the auditing decorator. |

## FILE SCOPE
Only the following files may be created or modified:

```text
apps/mobile/src/skills/gemini/geminiService.ts      (create)
apps/mobile/src/skills/gemini/validation.ts         (create)
apps/mobile/src/skills/pdf/pdfGenerator.ts          (create)
apps/mobile/src/skills/pdf/styles.ts               (create)
apps/mobile/src/skills/pipeline.ts                 (create)
apps/mobile/__tests__/skills/gemini.test.ts         (create)
apps/mobile/__tests__/skills/pdf.test.ts            (create)
apps/mobile/__tests__/skills/pipeline.test.ts       (create)
specs/modules/validation-guardrails.spec.md         (update)
specs/tasks/04-gemini-pdf-pipeline-decisions.md    (create)
specs/tasks/04-gemini-pdf-pipeline.state.md        (update)
```

## TDD CONTRACT

### 1. New Test Suites

#### `__tests__/skills/gemini.test.ts`
- Assert Zod payload validation rejects empty `raw_text` requests.
- Assert Zod payload validation rejects missing `systemInstruction`.
- Assert call structure matches Gemini API specification (headers, JSON wrapper).
- Assert output Markdown is saved successfully to `videos.markdownReport`.

#### `__tests__/skills/pdf.test.ts`
- Assert `pdfGenerator` compiles Markdown to HTML via `markdown-it`.
- Assert generated HTML contains Material 3 CSS stylesheet strings (colors, typography).
- Assert `expo-print`'s `printToFileAsync` is invoked with correct parameters.
- Assert output PDF URI is returned properly.

#### `__tests__/skills/pipeline.test.ts`
- Assert video status transitions sequentially through: `transcribing` → `processing` → `generating_pdf` → `complete`.
- Assert pipeline writes to `audit_logs` using `withAuditCatch` at every block.
- Assert Zod validation failure halts pipeline, logs `failed` to audit log, and shows error toast.
- Assert fetch failures halt pipeline, log `failed` to audit log, and show error toast.
- Assert success calls `useToastStore.show` with `'success'`.
- Assert failure calls `useToastStore.show` with `'error'`.

### 2. Regression Assertions
- All 31 existing tests must remain green.

## OUT OF SCOPE
- No direct styling of the React Native app screen.
- No network sync operations (Task 05).
- No API key hardcoding (must use an environment variable or config hook).

## DONE MEANS
- [ ] All 3 new test suites pass green.
- [ ] 31/31 regression tests remain green.
- [ ] Toast states verified in mock tests.
- [ ] Zod schema rejects malformed payloads before request is transmitted.
- [ ] `04-gemini-pdf-pipeline-decisions.md` written.
- [ ] `validation-guardrails.spec.md` updated.
- [ ] Test console logs appended to state tracker.
