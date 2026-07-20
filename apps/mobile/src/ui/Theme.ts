import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

const fontConfig = {
  customVariant: {
    fontFamily: Platform.select({
      web: 'Newsreader, EB Garamond, Georgia, serif',
      ios: 'EB Garamond',
      android: 'serif',
      default: 'serif',
    }),
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  displayLarge: {
    fontFamily: Platform.select({
      web: 'Newsreader, EB Garamond, Georgia, serif',
      ios: 'EB Garamond',
      android: 'serif',
      default: 'serif',
    }),
    fontWeight: '700' as const,
  },
  displayMedium: {
    fontFamily: Platform.select({
      web: 'Newsreader, EB Garamond, Georgia, serif',
      ios: 'EB Garamond',
      android: 'serif',
      default: 'serif',
    }),
    fontWeight: '700' as const,
  },
  displaySmall: {
    fontFamily: Platform.select({
      web: 'Newsreader, EB Garamond, Georgia, serif',
      ios: 'EB Garamond',
      android: 'serif',
      default: 'serif',
    }),
    fontWeight: '700' as const,
  },
  headlineLarge: {
    fontFamily: Platform.select({
      web: 'Newsreader, EB Garamond, Georgia, serif',
      ios: 'EB Garamond',
      android: 'serif',
      default: 'serif',
    }),
    fontWeight: '700' as const,
    fontSize: 32,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: Platform.select({
      web: 'Newsreader, EB Garamond, Georgia, serif',
      ios: 'EB Garamond',
      android: 'serif',
      default: 'serif',
    }),
    fontWeight: '600' as const,
    fontSize: 24,
    lineHeight: 32,
  },
  headlineSmall: {
    fontFamily: Platform.select({
      web: 'Newsreader, EB Garamond, Georgia, serif',
      ios: 'EB Garamond',
      android: 'serif',
      default: 'serif',
    }),
    fontWeight: '600' as const,
    fontSize: 20,
    lineHeight: 26,
  },
  titleLarge: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '600' as const,
    fontSize: 18,
    lineHeight: 24,
  },
  titleMedium: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '500' as const,
    fontSize: 16,
    lineHeight: 20,
  },
  titleSmall: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 18,
  },
  labelLarge: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '500' as const,
    fontSize: 13,
    lineHeight: 16,
  },
  labelMedium: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '500' as const,
    fontSize: 12,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '500' as const,
    fontSize: 11,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      default: 'sans-serif',
    }),
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
  },
};

export const EditorialTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ffd796',
    primaryContainer: '#e5ba73',
    background: '#131313',
    surface: '#131313',
    surfaceVariant: '#201f1f',
    surface_container_lowest: '#0e0e0e',
    surface_container_low: '#191919',
    surface_container: '#201f1f',
    surface_container_high: '#282828',
    surface_container_highest: '#333333',
    onPrimary: '#1a0f00',
    onPrimaryContainer: '#2e1c00',
    onSurface: '#e1e2ec',
    onSurfaceVariant: '#c2c6d6',
    outline: '#424754',
    outlineVariant: '#8c909f',
    // Disable shadow by setting elevations to transparent / flat colors
    elevation: {
      level0: 'transparent',
      level1: '#201f1f',
      level2: '#282828',
      level3: '#333333',
      level4: '#383838',
      level5: '#444444',
    },
  },
  // Custom design style guidelines tokens (Intellectual Noir)
  roundness: 4, // Sharp/Utilitarian editorial look
};
