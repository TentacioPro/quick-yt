## Goal Description
This plan addresses multiple critical items:
1. Resolving the `installTurboModule` crash preventing the app from loading.
2. Establishing a strategy for UI Testing (TDD) to match our backend/skills rigor.
3. Providing a clear summary of all tests written so far and the edge cases they handle.
4. Defining how to maintain context across new agent sessions.

## User Review Required
> [!IMPORTANT]
> Please review the proposed Dependency Downgrades to fix the TurboModule crash. We must align `react-native-reanimated`, `react-native-gesture-handler`, and `react-native-screens` with the exact versions expected by Expo SDK 54.

## Open Questions
> [!QUESTION]
> 1. **UI Testing Approach:** For UI tests, do you prefer snapshot testing (which catches unintended visual changes but can be brittle) alongside functional interaction tests, or strictly functional interaction tests using `@testing-library/react-native`?
> 2. **Task Spec:** Should we create a new formal task spec (e.g., `specs/tasks/13-ui-tdd.md`) to track the retrofitting of tests for existing screens (Dashboard, Settings, Info, Navigation)?

## Context Handoff Guide
To begin a new session with the same context, you do not necessarily need to create new files. Provide the following files as context to the new agent:
- `AGENTS.md` (Core mission directives)
- `plan.md` (The Monorepo Execution Plan)
- `specs/tasks/00-spec-system.md` (The spec ledger system rules)
- `specs/tasks/quick-yt-autopilot.md` (Primary execution directive for autonomous sessions)
- The current active task spec (e.g., `specs/tasks/13-ui-tdd.md`)

*No modifications to `AGENTS.md` are required, as it already points agents to the `specs/tasks/` directory where the state is tracked.*

## Summary of Existing Tests & Edge Cases
So far, we have comprehensive tests covering the Database, Domain Skills, State Management, and Sync workflows. **Zero UI tests currently exist.**

Here is a breakdown of what has been tested and the edge cases handled:

### 1. Database & Audit Layer (`__tests__/db/`)
- **`audit.test.ts` & `schema.test.ts`**: Verifies Drizzle schemas and `logAction`. 
  - *Edge Cases:* Handles `null` entity IDs gracefully; auto-generates IDs and timestamps close to `Date.now()`.
- **`withAuditCatch.test.ts`**: Tests the Higher-Order Function wrapping async ops. 
  - *Edge Cases:* Accurately logs `failed` status and re-throws original errors on failure; handles `null` entity IDs on both success and error branches.

### 2. Domain Skills (`__tests__/skills/`)
- **`gemini.test.ts` & `vision.test.ts`**: Tests Gemini Text/Vision API interactions and Zod validation. 
  - *Edge Cases:* Rejects empty payloads/API keys; throws custom errors on non-200 HTTP responses (e.g., 403 Forbidden).
- **`pdf.test.ts`**: Tests Markdown-to-HTML conversion and PDF generation. 
  - *Edge Cases:* Handles print service/spooler failures.
- **`pipeline.test.ts`**: Orchestrates E2E video pipeline (Transcript -> Gemini -> PDF -> DB -> Toast). 
  - *Edge Cases:* Halts pipeline immediately on transcript failure or Gemini API quota limits, triggering error toasts.
- **`transcript.test.ts`**: Tests YouTube URL validation and XML caption parsing. 
  - *Edge Cases:* Defaults to English but supports explicit language codes; throws specific errors if HTML lacks JSON, JSON lacks captions, XML is empty, or network fails.

### 3. State Management & Local Dev Sync (`__tests__/store/` & `__tests__/sync/`)
- **`useToastStore.test.ts`**: Verifies Zustand toast state. 
  - *Edge Cases:* Multi-show calls enforce last-write-wins (no queuing).
- **`backgroundSync.test.ts` & `devSyncManager.test.ts`**: Tests BackgroundFetch task and Express server sync operations. 
  - *Edge Cases:* Gracefully handles offline sync-server (500), missing local DB files, and non-200 server responses during multipart uploads/downloads.

## Proposed UI TDD Strategy
We will adopt a rigorous UI TDD approach using `@testing-library/react-native`:
1. **Red (Test First):** Write tests asserting the presence of critical UI elements (e.g., `getByText('Document Ingestion')`, `getByRole('button', { name: 'Add to Index' })`), and simulate user interactions (e.g., `fireEvent.changeText`).
2. **Green (Implement):** Build or adjust the React Native component until the test passes.
3. **Refactor:** Ensure styles align with the `EditorialTheme`.

## Proposed Changes (Code)

### Dependency Resolution (Fixing the Crash)
The Expo CLI warned about mismatched versions causing the TurboModule crash. We will align them.
#### [MODIFY] `apps/mobile/package.json`
- Downgrade `react-native-gesture-handler` to `~2.28.0`
- Downgrade `react-native-reanimated` to `~4.1.1`
- Downgrade `react-native-screens` to `~4.16.0`

### Babel Configuration
#### [MODIFY] `apps/mobile/babel.config.js`
- Add `react-native-reanimated/plugin` to plugins (required for Reanimated v2+).

### Duplicate Navigation Cleanup
There are conflicting Navigation files causing rendering issues.
#### [DELETE] `apps/mobile/Navigation.tsx` (Root level duplicate)
#### [MODIFY] `apps/mobile/src/Navigation.tsx`
- Ensure it properly handles mock data passing to `DashboardScreen` (as it was in the root version) so the UI doesn't crash on undefined props.

## Verification Plan

### Automated Tests
1. Run `pnpm --filter mobile test` to ensure all 121+ existing tests remain green.
2. Introduce initial UI tests for `DashboardScreen` and verify they pass.

### Manual Verification
1. Clear cache and start the server: `pnpm --filter mobile start -c`
2. Launch in Expo Go on your device.
3. Verify the TurboModule crash is gone and the app renders the Dashboard.
