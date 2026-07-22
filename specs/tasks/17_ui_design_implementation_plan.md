## Goal Description
The objective is to implement the newly finalized "Minimalist Slate" design system across the `Quick_yt` React Native Expo application. This will be done following the project's strict Spec System and UI TDD norms. I will implement the UI component by component, writing tests first, ensuring exact visual replication of the provided HTML/CSS designs, wiring the backend data/endpoints (SQLite and Sync), and making granular Git commits for each component.

## User Review Required
> [!IMPORTANT]
> The provided HTML designs use the "Minimalist Slate" aesthetic, which departs from the previous "Intellectual Noir" theme (light mode `#FFFFFF` vs deep charcoals). I will update the `ui-ux.spec.md` living document to reflect this pivot before implementing the code.
> Please confirm if this is correct and if I should proceed with the step-by-step TDD implementation.

## Proposed Changes
I will break down the work into a new chronological task: `specs/tasks/17-ui-design-implementation.md`.

### `specs/modules/ui-ux.spec.md`
#### [MODIFY] ui-ux.spec.md
I will update the living spec to replace "Intellectual Noir" with "Minimalist Slate" rules:
- **Canvas:** `#FFFFFF`
- **Surface:** `#F5F5F5` and `#E0E0E0`
- **Primary Ink:** `#000000`
- **Accent:** `#FFB300`
- **Typography:** Newsreader (Headers) & Inter (Body). No borders, high contrast.

### `specs/tasks/17-ui-design-implementation.md`
#### [NEW] 17-ui-design-implementation.md
I will create the task specification explicitly laying out the TDD contract, reuse map, and step-by-step goals for each component.

### App Theme
#### [MODIFY] apps/mobile/src/ui/Theme.ts (or equivalent)
I will implement the custom React Native Paper MD3 theme to match the new color palette exactly, ensuring `<PaperProvider>` uses these new tokens.

### Dashboard Screen
#### [MODIFY] apps/mobile/src/ui/DashboardScreen.tsx
#### [MODIFY] apps/mobile/__tests__/ui/DashboardScreen.test.tsx
1. **Red:** Update UI tests to expect "Processing Hub", "Active Processing", and "Recent Activity" sections.
2. **Green:** Replicate the `quickyt_dashboard_minimalist_slate` design using React Native components (`View`, `Text`, Material Community Icons).
3. **Wire:** Connect `getDrizzleDb()` / Zustand state to populate the Active Processing (pending videos) and Recent Activity (audit logs).
4. **Commit:** `git commit -m "feat(ui): implement Minimalist Slate Dashboard"`

### Video Detail & Settings Screens
#### [MODIFY] apps/mobile/src/ui/VideoDetailScreen.tsx
#### [MODIFY] apps/mobile/src/ui/SettingsScreen.tsx
I will follow the exact same TDD Red-Green-Wire-Commit cycle for the remaining screens specified in the `specs/designs/FinalDesign...` folders.

## Verification Plan
### Automated Tests
```bash
pnpm --filter mobile test
```
This will be run after every single component implementation to ensure zero regressions in the existing 121+ backend tests and the newly written UI tests.

### Manual Verification
- Launch the Expo app locally or via Expo Go to visually verify the screens match the provided PNGs and HTML designs pixel-for-pixel.
- Verify that haptics, routing, and data fetching (videos/logs) work seamlessly.
