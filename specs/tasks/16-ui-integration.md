# Task 16: UI Integration & Native UX

## Goal
Integrate the 9 Stitch-generated visual blueprints (Metrics, Logs, Profile, Video Details, Markdown Viewer, PDF Viewer, Notes Feed, Compose Note, Sidebar) into the Expo app, adhering to the 'Intellectual Noir' theme and strict Native Android UX.

## Specifications

### 1. Database Schema
Introduce `video_notes` table to support the Video Notes functionality:
- `id` (text, primary key)
- `videoId` (text, references `videos.id`)
- `content` (text, markdown content)
- `timestamp` (integer, creation timestamp)
- `synced` (integer, 0 or 1)
- `videoTimestamp` (integer, tracks the exact moment in the video the note refers to, e.g., 12:44)
- `tags` (text/JSON, stores analytical lens tags like 'Cinematography', 'Pacing')

### 2. Forms & Validation
- Mandate the use of `react-hook-form` and `zod` for `ComposeNoteScreen` and `ProfileSettingsScreen`.
- Compose Note must support raw Markdown input to match the toolbar design.

### 3. Crash Analytics
- Initialize Sentry for crash reporting.
- Create `src/utils/telemetry.ts` wrapper to initialize `@sentry/react-native`.

### 4. Native Utilities
- `expo-clipboard`: For copying logs, metrics, and data.
- `expo-sharing` & `expo-print`: For PDF generation and OS-level sharing/preview of reports.

### 5. UX Consistency
- `expo-haptics`: Systematically apply to all buttons/copy actions.
- `android_ripple`: Ensure application on all list items and touchable surfaces.

## Implementation Steps (TDD)
1. **Red**: Write failing tests for `schema.ts` (asserting `video_notes` table columns) and `ComposeNoteScreen.test.tsx`.
2. **Green**: Implement DB schema, Telemetry wrapper, and `ComposeNoteScreen`.
3. **Gate**: Verify tests pass.
4. **Iterate**: Build out the remaining screens and native utilities.
