# 15 — UI/UX Elevation & New Views

## GOAL
Elevate the overall visual design and user experience of the Quick_yt application by adding proper iconography, improving typographical readability, ensuring layout responsiveness, integrating haptics, and adding new dedicated views (Metrics, Audit Logs, Profile, Settings).

## MODULE SPECS IN SCOPE
- `specs/modules/ui-ux.spec.md` (To be updated with new metrics/logs layout guidelines and haptic standards).

## REUSE MAP
| Existing Asset | Path | How It's Reused |
|---|---|---|
| `GlobalSnackbar` | `apps/mobile/src/ui/GlobalSnackbar.tsx` | Reuse `expo-haptics` integration patterns for other UI elements. |
| `Navigation` | `apps/mobile/src/Navigation.tsx` | Add new Drawer screens for Logs, Metrics, and Profile. |
| `AuditLog` Table | `apps/mobile/src/db/schema.ts` | Query and display in the new Logs Grid. |

## TDD CONTRACT
1. **Tests to write FIRST**:
   - `__tests__/ui/MetricsScreen.test.tsx`: Must fail on empty implementation.
   - `__tests__/ui/LogsGridScreen.test.tsx`: Must fail on empty implementation.
   - `__tests__/ui/ProfileSettingsScreen.test.tsx`: Must fail on empty implementation.
2. **Existing tests that must remain green**:
   - `__tests__/ui/DashboardScreen.test.tsx` (Update to accommodate icon additions).
   - `__tests__/ui/VideoDetailScreen.test.tsx`.
3. **The failing-forward target tests**:
   - New screens must render correctly and match snapshots or functional assertions (e.g. settings toggle actions dispatch correctly).

## OUT OF SCOPE
- Changing the underlying Drizzle SQLite schema for Videos/Audit Logs (use existing tables).
- Implementing complex backend user authentication for the Profile page (keep it local/mocked for now).

## DONE MEANS
- [ ] Added `MetricsScreen`, `LogsGridScreen`, and `ProfileSettingsScreen`.
- [ ] Added React Native Vector Icons to the Drawer navigation and main dashboard buttons.
- [ ] Integrated `expo-haptics` for all primary button presses and interactions.
- [ ] Improved spacing and font sizes (`Readability` & `Responsiveness`) across all existing screens.
- [ ] All new and existing TDD tests are green.
- [ ] `15-ui-ux-elevation-decisions.md` is written.
- [ ] Relevant `specs/modules/` are updated.
