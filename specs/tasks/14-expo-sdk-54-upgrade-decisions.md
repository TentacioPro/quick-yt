# 14 — Expo SDK 54 Upgrade Decisions

## Technical Architectural Choices
1. **React Native Worklets Versioning**: Explicitly locked `react-native-worklets` to `0.5.1` to resolve native lock issues introduced by Expo SDK 54 and React Native 0.81 compatibility.
2. **Reanimated Config**: Removed `react-native-reanimated/plugin` from `babel.config.js` as it is deprecated and no longer required for Reanimated 4, which ships with Expo 54.
3. **React Navigation Theme Patch**: Discovered that React Navigation requires a complete `Theme` object (including `fonts` and `dark` boolean) when passing a custom theme. Instead of passing a partial object with just overridden colors, we now spread `DarkTheme` directly from `@react-navigation/native` inside `<NavigationContainer theme={{...DarkTheme, colors: {...}}}>`. This prevents crashes when rendering header titles that attempt to pull font properties from the theme.
