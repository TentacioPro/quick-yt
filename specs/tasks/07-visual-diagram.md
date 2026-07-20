# 07 — Visual Diagram Extraction

## GOAL
Implement the visual keyframe diagram extraction capability inside `apps/mobile/src/skills/vision/`. This includes mocking visual image payloads, validating base64 image requests via Zod, calling Gemini 1.5 Pro's multimodal endpoint to process screenshots/slides, and saving the resulting visual/diagram markdown report into a new SQLite column `videos.visualReport`. All operations must be audited via `withAuditCatch` and trigger toast/haptics.

## MODULE SPECS IN SCOPE
- `specs/modules/db-layer.spec.md` — SQLite schema modifications.
- `specs/modules/validation-guardrails.spec.md` — Zod multimodal validation rules.
- `specs/modules/ui-ux.spec.md` — Haptics and Toast notifications.

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Drizzle schema | `apps/mobile/src/db/schema.ts` | Expand `videos` schema to add `visualReport` text column. |
| DB client accessors | `apps/mobile/src/db/client.ts` | Write extracted visual reports to SQLite. |
| useToastStore | `apps/mobile/src/store/useToastStore.ts` | Displays Snackbar alerts on success/failure. |
| withAuditCatch | `apps/mobile/src/db/withAuditCatch.ts` | Wrap the multimodal extraction processes in the auditing decorator. |

## FILE SCOPE
Only the following files may be created or modified:

```text
apps/mobile/src/db/schema.ts                       (modify — add visualReport column)
apps/mobile/src/skills/vision/geminiVision.ts       (create)
apps/mobile/src/skills/vision/validation.ts         (create)
apps/mobile/__tests__/skills/vision.test.ts        (create)
specs/modules/db-layer.spec.md                     (update)
specs/modules/validation-guardrails.spec.md         (update)
specs/tasks/07-visual-diagram-decisions.md         (create)
specs/tasks/07-visual-diagram.state.md             (update)
```

## TDD CONTRACT

### 1. New Test Suites

#### `apps/mobile/__tests__/skills/vision.test.ts`
- Assert Zod multimodal request schema rejects payloads missing base64 image data.
- Assert Zod multimodal request schema rejects payloads missing image mimetype headers (e.g. must be `image/jpeg` or `image/png`).
- Assert `geminiVision` formats requests matching Gemini's multi-part content api structure (inlineData base64 text parts).
- Assert successful generation writes the returned architectural report to `videos.visualReport`.
- Assert failures log `failed` to the audit log and trigger error toasts.

### 2. Regression Assertions
- All previous tests must remain green.

## OUT OF SCOPE
- Actual device-level video frame extraction logic (which requires heavy native decoders; keyframes will be mocked/passed as buffers for this task).

## DONE MEANS
- [ ] Multimodal Zod validation and visual extraction tests pass green.
- [ ] All prior tests remain green.
- [ ] Database schema changes verified (visualReport column added).
- [ ] Decisions log written.
- [ ] Specs updated.
- [ ] Console logs appended to state.
