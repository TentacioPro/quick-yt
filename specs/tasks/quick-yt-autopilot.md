# Autopilot Pack — Quick_yt End-to-End Execution Protocol
*Place at `specs/tasks/quick-yt-autopilot.md`. This file authorizes the agent (Agy-CLI / Claude / Kiro) to run the remaining execution queue autonomously WITHOUT pausing for human approval at every step. Written after Task 02 successfully established the DB and TDD foundation.*

---

## §1 THE AUTONOMY CONTRACT (Paste this as the session opener)

> Read `specs/tasks/quick-yt-autopilot.md` §1–§4 and `AGENTS.md`. You are authorized to execute the QUEUE in §2 autonomously, task by task, WITHOUT stopping for my approval, under this strict contract:
>
> **ALLOWED without asking:** 
> Everything inside a numbered task spec's FILE SCOPE following the six-step loop; creating branches; committing; writing state and decision files; running `pnpm --filter mobile test` and `pnpm install`; updating `specs/modules/*` as needed.
>
> **MUST STOP and record the blocker in the state file (then halt execution):**
> (a) Any test suite failing twice for the same cause.
> (b) Any attempt to modify files outside the explicit FILE SCOPE.
> (c) Any test that must be weakened or deleted to pass (weakening a test is ALWAYS a hard stop).
> (d) A Zod schema conflict or missing typing definition.
> (e) Any accidental import of `react-native` or `expo-*` inside portable skills (e.g., the transcript extractor).
>
> **SELF-REVIEW (Required before marking any task DONE):**
> 1. **Diff review:** Every changed assertion is STRONGER or equal. Test names exactly match what they assert.
> 2. **Error Guardrails:** `withAuditCatch` is wrapped around all I/O and network calls (excluding pure isolated skills). 
> 3. **Validation:** Zod schemas are strictly enforced on all payloads crossing boundaries.
> 4. **Decisions logged:** Alternatives rejected must be documented.
> 5. **Evidence:** Full terminal output (`pnpm test`) MUST be pasted in the state file. Only then can the task be marked closed.

---

## §2 THE EXECUTION QUEUE (Execute sequentially)

1. **T03 (YouTube Transcript Skill) — wt-03:** 
   - Read `03-transcript-skill.md`. 
   - Execute the pure TypeScript extractor.
   - **Crucial:** Implement Zod payload validation (`youtube_url`, `language_code`) and the `TranscriptError` typed contract. Mock `global.fetch`. 
   - **Gate:** Ensure ZERO React Native or Expo imports exist in this module. Full 18/18 regression + new tests must pass. Record decisions, update state, close T03.
2. **T04 (Gemini Pipeline + PDF Generation) — wt-04:**
   - Write `04-gemini-pdf-pipeline.md` (and state file) from `plan.md` Phase 4.
   - Implement Gemini API service with Zod request validation.
   - Implement Markdown-to-PDF conversion using `markdown-it` and `expo-print`.
   - Wire the orchestrator pipeline (`pipeline.ts`) using `withAuditCatch` for every stage. Trigger `useToastStore` on success/fail.
   - **Gate:** Mock `expo-print` and Gemini API. Ensure DB status transitions (`pending` → `processing` → `complete`) are logged. Close T04.
3. **T05 (Local Dev Sync Server & Manager) — wt-05:**
   - Write `05-dev-sync-workflow.md` (and state file) from `plan.md` Phase 5.
   - **Server (`tools/sync-server`):** Build Express endpoints, Multer file upload, and Zod middleware to reject non-`.db` files. Standardize all JSON error responses.
   - **Mobile (`apps/mobile`):** Build `DevSyncManager.ts` using `expo-file-system` upload/download, wrapped in `withAuditCatch`, triggering Toasts and Haptics.
   - **Gate:** 100% payload formatting coverage on mobile. Express tests (via `supertest`) confirm Zod rejects `.txt` files and accepts `.db`. Close T05.
4. **T06 (Background Task Metric Sync) — wt-06:**
   - Read `06-background-sync.md`.
   - **Server (`tools/sync-server`):** Add `POST /api/sync/metrics` endpoint that accepts audit log array payloads, validates via Zod, and appends to local JSON file.
   - **Mobile (`apps/mobile`):** Add a `synced` column to `auditLogs` table. Implement a background task using `expo-task-manager` and `expo-background-fetch` that transmits unsynced audit logs to the sync-server and updates their synced state.
   - **Gate:** Ensure background sync operations are fully tested under mock. All tests run green. Close T06.
5. **T07 (Visual Diagram Extraction) — wt-07:**
   - Read `07-visual-diagram.md`.
   - **Mobile (`apps/mobile`):** Add a `visualReport` column to `videos` table. Implement `geminiVision.ts` calling Gemini's multimodal API with mock base64 image data to create visual reports.
   - **Gate:** Multi-part Gemini API parameters and Zod validations are fully verified. All tests run green. Close T07.
6. **T08 (MCP Server Portability) — wt-08:**
   - Read `08-mcp-server.md`.
   - **Server (`tools/sync-server`):** Package the Express server inside `tools/sync-server` to expose standard Model Context Protocol (MCP) endpoints via HTTP SSE. Write `mcp.json` into `.vscode/` so the IDE can connect.
   - **Gate:** SSE tool outputs and routing are validated. All sync-server tests run green. Close T08.
7. **T09 (Automated Versioned Snapshots) — wt-09:**
   - Read `09-versioned-snapshots.md`.
   - **Server (`tools/sync-server`):** Build GFS backup rotation routine in Express server to retain daily (7 days), weekly (4 weeks), and monthly (12 months) backups. Trigger on backup post.
   - **Gate:** Verification unit tests for GFS date ranges are executed. All tests run green. Close T09.
8. **STOP LINE:** 
   - After T09 completes and tests run green across the entire workspace (`pnpm test`), write `specs/tasks/phase-3-report.md` summarizing all state files, metrics, and DB schemas built. End execution and await human review.


---

## §3 FUTURE CAPABILITIES → LEDGER APPENDS (Log for Phase 2)

Append these to the roadmap or decision ledgers as they arise:

| # | Task | Notes |
|---|---|---|
| 06 | **Background Task Metric Sync** | Leverage `expo-task-manager` to sync `audit_logs` silently to the PC when connected to the local Wi-Fi, without blocking the UI thread. |
| 07 | **Visual Diagram Extraction** | Add the secondary optional skill to pull keyframes from the YouTube video and process them via Gemini Vision, only if specifically toggled by the user (battery optimization). |
| 08 | **MCP Server Portability** | Wrap the Express Sync Server logic into an official Model Context Protocol (MCP) server so local IDEs can directly query the mobile app's SQLite DB state during development. |

---

## §4 METRICS PER TASK (Record in every `NN-*.state.md` upon closing)

```yaml
metrics:
  tool_calls_used: N (budget 40)
  gate_runs: N  
  gate_failures: N (cause per failure, one line)
  tests_added: N  
  tests_strengthened: N  
  tests_weakened: 0   # This MUST be 0. If > 0, halt and report.