# 13 — UI TDD Implementation

## GOAL
Retrofit comprehensive UI tests for the existing screens (`DashboardScreen`, `SettingsScreen`, `InfoScreen`, `VideoDetailScreen`, and `Navigation`) using `@testing-library/react-native` to achieve the same testing rigor as the backend/skills layer.

## MODULE SPECS IN SCOPE
- `specs/modules/ui-ux.spec.md` (To be created or updated if existing)

## REUSE MAP
| Existing Asset | Path | How It's Reused |
|---|---|---|
| DashboardScreen | `apps/mobile/src/ui/DashboardScreen.tsx` | Target for UI tests. |
| SettingsScreen | `apps/mobile/src/ui/SettingsScreen.tsx` | Target for UI tests. |
| InfoScreen | `apps/mobile/src/ui/InfoScreen.tsx` | Target for UI tests. |
| VideoDetailScreen | `apps/mobile/src/ui/VideoDetailScreen.tsx` | Target for UI tests. |

## TDD CONTRACT
1. **Tests to write FIRST:**
   - `DashboardScreen.test.tsx`: Assert presence of "Document Ingestion", "Add to Index" button, and mock video list items. Simulate text input and button press.
   - `SettingsScreen.test.tsx`: Assert presence of API Key input, Language toggle, and Dark Theme switch. Simulate toggles.
   - `InfoScreen.test.tsx`: Assert presence of app description and versioning information.
   - `VideoDetailScreen.test.tsx`: Assert rendering of video details, summary, and action buttons.
2. **Existing tests that must remain green:**
   - All 121+ existing tests in `apps/mobile/__tests__/` covering DB, Sync, Store, and Skills.
3. **The failing-forward target tests that this specific task turns green:**
   - The newly written UI tests in `apps/mobile/__tests__/ui/`.

## OUT OF SCOPE
- Adding new UI features or screens.
- Modifying backend sync logic.

## DONE MEANS
- [ ] All new UI TDD tests are green.
- [ ] `13-ui-tdd-decisions.md` is fully written with explicit trade-offs regarding snapshot vs. functional interaction tests.
- [ ] Paste verifiable terminal test summaries showing zero failures.
