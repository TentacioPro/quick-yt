# 14 — Expo SDK 54 Upgrade

## GOAL
Ensure the mobile app is fully compatible with Expo SDK 54, resolving any dependencies or Babel configuration issues (e.g., removing the `react-native-reanimated/plugin` required by older versions).

## MODULE SPECS IN SCOPE
None.

## REUSE MAP
| Existing Asset | Path | How It's Reused |
|---|---|---|
| Babel Config | `apps/mobile/babel.config.js` | Update configuration for SDK 54. |
| Package Json | `apps/mobile/package.json` | Ensure versions align with SDK 54. |

## TDD CONTRACT
1. **Tests to write FIRST:** None required for config updates.
2. **Existing tests that must remain green:**
   - All 60+ mobile tests must run without Babel parsing errors.

## OUT OF SCOPE
Refactoring UI or logic components.

## DONE MEANS
- [x] Babel configuration updated (removed `react-native-reanimated/plugin`).
- [x] `npx expo install --fix` executed successfully.
- [ ] Tests run successfully.
