import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  show: (message: string, type: ToastType) => void;
  dismiss: () => void;
}

/**
 * Global toast store — last-write-wins (no queue).
 * Consumers call useToastStore.getState().show() for out-of-tree (non-hook) usage.
 * GlobalSnackbar reads this store and fires expo-haptics on each show().
 */
export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'info',

  show: (message: string, type: ToastType) =>
    set({ visible: true, message, type }),

  dismiss: () =>
    set({ visible: false }),
}));
