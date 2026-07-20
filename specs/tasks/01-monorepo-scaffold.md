# 01 — Monorepo Scaffold + Toast UX Foundation

## GOAL
A fully installable pnpm monorepo with two workspace packages — `apps/mobile` (Expo SDK 51+, TypeScript) and `tools/sync-server` (Node.js, Express, TypeScript) — plus a global `useToastStore` (Zustand) and `GlobalSnackbar` (React Native Paper + expo-haptics) wired at the app root. The gate is a clean `pnpm install` from the workspace root with zero errors and all directory structures in place.

## MODULE SPECS IN SCOPE
- `specs/modules/ui-ux.spec.md` — Material Design 3 rules, Zustand stores, Toast & Haptics.
- `specs/modules/validation-guardrails.spec.md` — Zod is added as a dependency in this task (runtime schemas defined in later tasks).

## REUSE MAP
| Existing Module / Code | File Path | Application Strategy |
|---|---|---|
| Vision & constraints | `01_Vision_and_Plan.md` | Target device (Pixel 8a), UI library (RN Paper), state (Zustand + Drizzle), performance constraints. Drives dependency selection. |
| Monorepo tree spec | `02_Architecture_and_TDD.md` (L4–L24) | Exact directory skeleton replicated in scaffold. |
| Sync server reference impl | `04_DevSync_MCP_Server.md` (L11–L45) | Placeholder `index.ts` stubbed from this spec; full impl deferred to Task 05. |
| Plan v2 — Phase 1 | `plan.md` § Phase 1 | Authoritative task breakdown for this card. |

## FILE SCOPE
Only the files below may be created or modified by this task. Any edit outside this list is a structural violation.

```text
# Root workspace
package.json                              (create)
pnpm-workspace.yaml                       (create)
.gitignore                                (create)

# Expo mobile app
apps/mobile/                              (scaffolded via create-expo-app)
apps/mobile/src/db/.gitkeep               (create)
apps/mobile/src/store/useToastStore.ts     (create)
apps/mobile/src/skills/.gitkeep           (create)
apps/mobile/src/sync/.gitkeep             (create)
apps/mobile/src/ui/GlobalSnackbar.tsx      (create)
apps/mobile/package.json                  (modify — add dependencies)
apps/mobile/tsconfig.json                 (modify — if needed for paths)
apps/mobile/App.tsx                       (modify — mount GlobalSnackbar)

# Sync server
tools/sync-server/package.json            (create)
tools/sync-server/tsconfig.json           (create)
tools/sync-server/Dockerfile              (create)
tools/sync-server/.dev-backups/.gitkeep   (create)
tools/sync-server/src/index.ts            (create — placeholder only)
```

## TDD CONTRACT

### 1. New Suite Additions
Since Phase 1 is a scaffold phase, the primary validation is structural rather than behavioral. However, the `useToastStore` and `GlobalSnackbar` are logic-bearing and require tests.

| Test File | Assertions |
|---|---|
| `apps/mobile/__tests__/store/useToastStore.test.ts` | ① `show('msg', 'success')` sets `visible: true`, `message: 'msg'`, `type: 'success'`. ② `dismiss()` sets `visible: false`. ③ Calling `show()` twice overwrites the previous state (no queue — last-write-wins). |

> [!NOTE]
> `GlobalSnackbar.tsx` is a presentational component coupled to `expo-haptics` and RN Paper; it will be visually verified on-device. Its haptic trigger logic is tested indirectly via the store test and directly in Phase 4/5 integration tests.

### 2. Regression Assertions
No prior tests exist. This task establishes the baseline.

### 3. Structural Gate Checks (Non-Jest)
These are verified via terminal commands, not Jest:

| Check | Command | Pass Condition |
|---|---|---|
| Workspace install | `pnpm install` | Exit code 0, no `ERR!` in output |
| Mobile dependency resolution | `pnpm --filter mobile list --depth 0` | Lists `react-native-paper`, `zustand`, `drizzle-orm`, `expo-sqlite`, `zod`, and all other deps |
| Sync-server dependency resolution | `pnpm --filter sync-server list --depth 0` | Lists `express`, `multer`, `cors`, `zod` |
| Directory skeleton exists | `test -d apps/mobile/src/db && test -d apps/mobile/src/store && test -d apps/mobile/src/skills && test -d apps/mobile/src/sync && test -d apps/mobile/src/ui` | Exit code 0 |
| Toast store test | `pnpm --filter mobile test -- --testPathPattern=useToastStore` | All assertions pass |

## DEPENDENCIES TO INSTALL

### `apps/mobile` — Production
```
react-native-paper  react-native-safe-area-context  react-native-vector-icons
zustand
drizzle-orm  expo-sqlite
expo-file-system  expo-print  expo-haptics  expo-updates
markdown-it
zod
```

### `apps/mobile` — Dev
```
drizzle-kit
jest  @types/jest  ts-jest  jest-expo
@types/markdown-it
```

### `tools/sync-server` — Production
```
express  multer  cors  zod
```

### `tools/sync-server` — Dev
```
typescript  ts-node  @types/express  @types/multer  @types/cors  @types/node
```

## OUT OF SCOPE
- **No Drizzle schemas.** `src/db/` receives a `.gitkeep` only. Schema implementation is Task 02.
- **No Jest configuration for mobile.** `jest.config.js` and `jest.setup.js` with `expo-sqlite` mocks are Task 02.
- **No sync server logic.** `tools/sync-server/src/index.ts` is a placeholder that imports Express and listens on port 4000 with a health-check route only. Full implementation is Task 05.
- **No transcript, Gemini, or PDF code.** Those are Tasks 03 and 04.
- **No Zod schemas.** Zod is installed as a dependency; runtime schemas are defined in Tasks 03, 04, and 05.
- **No `expo-task-manager` setup.** Background processing is deferred to the UI integration phase.

## DONE MEANS
- [ ] `pnpm install` from workspace root completes with exit code 0.
- [ ] All directories in the FILE SCOPE list exist.
- [ ] `apps/mobile/package.json` contains every dependency listed in DEPENDENCIES TO INSTALL.
- [ ] `tools/sync-server/package.json` contains every dependency listed in DEPENDENCIES TO INSTALL.
- [ ] `useToastStore.test.ts` passes with all 3 assertions green.
- [ ] `GlobalSnackbar.tsx` is mounted in the app root component.
- [ ] `01-monorepo-scaffold-decisions.md` is fully written with explicit trade-offs.
- [ ] Relevant `specs/modules/` are updated to match new realities (`ui-ux.spec.md` for Toast store shape).
- [ ] Pasted verifiable terminal test summaries showing zero failures are appended to the state file.
