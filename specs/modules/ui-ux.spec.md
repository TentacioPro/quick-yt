# Living Specification — UI/UX

> Last updated by: Task 01 — Monorepo Scaffold
> Driven by: `specs/tasks/01-monorepo-scaffold.md`

---

## 1. Design System

- **UI Library:** React Native Paper v5 (Material Design 3)
- **Provider:** `<PaperProvider>` wraps entire app tree. Must be child of `<SafeAreaProvider>`.
- **Target Device:** Pixel 8a — notch-aware layouts required via `SafeAreaProvider`.
- **Typography:** React Native Paper default MD3 type scale. Custom font overrides deferred, but should lean toward Newsreader/Inter.

### 1.1 Native Android UX Mandates
- **Navigation:** Must support hardware back-button routing natively.
- **Drawer:** Must support swipe-from-left gesture to open the Drawer navigation.
- **Touchables:** All touchable surfaces must utilize native `android_ripple` effects. Do not use generic opacity fades (e.g. `TouchableOpacity` should be replaced or wrapped to support ripples on Android).
- **Haptics:** Systematic `expo-haptics` feedback must be paired with primary interactions (light for selections, medium for buttons, heavy for errors/success).

### 1.2 Theme Constraints (Intellectual Noir)
- **Palette:** Deep charcoals for backgrounds, amber accents for highlights.
- **Typography:** Serif headers.
- **Layout:** Sleek and continuous. Absolutely no dividing lines or borders. Use spacing and depth (shadows/elevation) to separate content.

---

## 2. Global Toast Store (`useToastStore`)

**File:** `apps/mobile/src/store/useToastStore.ts`

**State Shape:**
```typescript
type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  show: (message: string, type: ToastType) => void;
  dismiss: () => void;
}
```

**Behavioural Contract:**
- `show()` is **last-write-wins** — no message queue. Calling twice overwrites the previous state.
- `dismiss()` sets `visible: false`. Message and type are preserved until next `show()`.
- Out-of-tree (non-hook) usage: `useToastStore.getState().show(...)`.

---

## 3. GlobalSnackbar Component

**File:** `apps/mobile/src/ui/GlobalSnackbar.tsx`

**Mount point:** Inside `<PaperProvider>`, at app root (`App.tsx`). Renders as sibling to screen content.

**Auto-dismiss:** 3500ms.

**Type → Style Mapping:**
| Type | Background Colour | Haptic |
|---|---|---|
| `success` | `#1B5E20` (MD3 Green-900) | `notificationAsync(Success)` |
| `error` | `#B71C1C` (MD3 Red-900) | `notificationAsync(Error)` |
| `info` | `#0D47A1` (MD3 Blue-900) | `impactAsync(Light)` |

**Haptic failure:** Silently swallowed via `.catch()`. Haptics may be unavailable on simulators/web.

---

## 4. Haptics Policy

- **Library:** `expo-haptics`
- **Trigger point:** `GlobalSnackbar` fires haptics inside a `useEffect` when `visible` becomes `true`.
- All other haptic triggers (button presses, state changes) must route through `useToastStore.show()` → `GlobalSnackbar` — no direct `Haptics.*` calls in feature code unless for non-toast interactions (e.g., long-press feedback).

---

## 5. Caller Contract

Any code wishing to show a toast:
```typescript
// In async functions, hooks, event handlers — anywhere:
import { useToastStore } from '../store/useToastStore';

useToastStore.getState().show('Backup complete', 'success');
useToastStore.getState().show('Network error: timeout', 'error');
useToastStore.getState().show('Processing transcript…', 'info');
```

Never call `expo-haptics` directly for toast-class notifications.