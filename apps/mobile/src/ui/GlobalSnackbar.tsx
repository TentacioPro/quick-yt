import React, { useEffect } from 'react';
import { Snackbar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { useToastStore, ToastType } from '../store/useToastStore';

const HAPTIC_MAP: Record<ToastType, () => Promise<void>> = {
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  info: () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
};

const SNACKBAR_STYLE_MAP: Record<ToastType, object> = {
  success: { backgroundColor: '#1B5E20' },
  error: { backgroundColor: '#B71C1C' },
  info: { backgroundColor: '#0D47A1' },
};

const AUTO_DISMISS_MS = 3500;

/**
 * GlobalSnackbar — mount once at app root.
 * Reads from useToastStore. On each show(), fires matching expo-haptics feedback
 * before the snackbar becomes visible, providing physical native feedback.
 */
export function GlobalSnackbar() {
  const { visible, message, type, dismiss } = useToastStore();

  useEffect(() => {
    if (visible) {
      HAPTIC_MAP[type]().catch(() => {
        // Haptics may fail in simulator/web — silent catch is intentional
      });
    }
  }, [visible, type]);

  return (
    <Snackbar
      visible={visible}
      onDismiss={dismiss}
      duration={AUTO_DISMISS_MS}
      style={SNACKBAR_STYLE_MAP[type]}
      action={{
        label: 'OK',
        onPress: dismiss,
      }}
    >
      {message}
    </Snackbar>
  );
}
