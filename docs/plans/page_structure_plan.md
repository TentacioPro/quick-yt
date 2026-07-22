## Goal Description
The goal is to identify and outline all the screens (pages) required for the Quick‑YT mobile application based on the functionality and specifications implemented so far. This will guide further UI/UX development and navigation scaffolding.

## User Review Required
> [!IMPORTANT]
> Review the proposed page list and confirm if any additional screens are needed or if any listed screens should be omitted/merged.

## Open Questions
> [!QUESTION]
> 1. Do you want a dedicated **VideoDetail** screen that shows transcript, summary, and actions for a selected video?
> 2. Should the **Settings** screen contain language preferences, API key management, and theme toggles?
> 3. Is there a need for an **Authentication** flow (Login/Signup) or is the app purely anonymous?
> 4. Do you envision a **Search** screen separate from the dashboard ingestion UI?
> 5. Should the **About** screen include version info, legal notices, and a link to the project repository?

## Proposed Changes (Page List)
Below is the current set of pages that exist or are planned, categorized by their purpose.

---
### Existing Pages
- **DashboardScreen** (`src/ui/DashboardScreen.tsx`)
  - Primary UI for video ingestion, list of indexed videos, sync button, and insight block.
  - Wrapped in `SafeAreaView` for proper notch handling.

- **SettingsScreen** (`src/ui/SettingsScreen.tsx`)
  - Placeholder screen following the *Editorial Archive* theme.
  - Will host user preferences (language, theme, sync settings).

- **AboutScreen** (`src/ui/AboutScreen.tsx`)
  - Placeholder screen following the same visual theme.
  - Intended for project info, version, credits.

---
### Planned Additional Pages
1. **VideoDetailScreen** (`src/ui/VideoDetailScreen.tsx`)
   - Shows detailed information for a selected video: title, URL, transcription preview, generated markdown, status badge.
   - Provides actions: re‑ingest, delete, share.

2. **AuthScreen** (`src/ui/AuthScreen.tsx`)
   - Optional login/sign‑up UI if future authentication or user‑specific sync is required.

3. **SearchScreen** (`src/ui/SearchScreen.tsx`)
   - Allows users to search indexed videos by title, tags, or content.
   - Could be integrated into the drawer navigation.

4. **ProfileScreen** (`src/ui/ProfileScreen.tsx`)
   - Displays user profile info, API key visibility, and logout button.

5. **HelpScreen** (`src/ui/HelpScreen.tsx`)
   - Provides quick help, usage tips, and troubleshooting steps.

---
## Verification Plan
- **Automated Tests**: Ensure each new screen component renders without runtime errors using Jest + React Native Testing Library.
- **Manual Verification**: After navigation scaffolding is added, launch the app in Expo Go and confirm each drawer item opens the correct screen and UI elements appear as intended.

---
## Next Steps
1. Confirm the page list and answer the open questions above.
2. Once approved, create the missing screen files and update the drawer navigator accordingly.
3. Add navigation routes in `Navigation.tsx` and wire them into `App.tsx`.

*Please reply with any adjustments or approvals so we can proceed.*
