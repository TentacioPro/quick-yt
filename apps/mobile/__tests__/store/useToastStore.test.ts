/**
 * TDD — RED → GREEN
 * useToastStore.test.ts
 * Task 01: Monorepo Scaffold — useToastStore TDD contract
 *
 * Assertions (per 01-monorepo-scaffold.md § TDD CONTRACT):
 *   ① show('msg', 'success') sets visible: true, message: 'msg', type: 'success'
 *   ② dismiss() sets visible: false
 *   ③ Calling show() twice overwrites previous state (last-write-wins, no queue)
 *
 * Note: Using zustand's getState() directly — no React renderer needed for store unit tests.
 * This avoids the @testing-library/react-hooks / React 19 peer dep conflict.
 */

import { useToastStore } from '../../src/store/useToastStore';

// Reset store state between tests using zustand setState
beforeEach(() => {
  useToastStore.setState({
    visible: false,
    message: '',
    type: 'info',
  });
});

describe('useToastStore', () => {
  it('① show() sets visible:true, message, and type correctly', () => {
    useToastStore.getState().show('Operation successful', 'success');

    const state = useToastStore.getState();
    expect(state.visible).toBe(true);
    expect(state.message).toBe('Operation successful');
    expect(state.type).toBe('success');
  });

  it('② dismiss() sets visible:false', () => {
    useToastStore.getState().show('Something went wrong', 'error');
    expect(useToastStore.getState().visible).toBe(true);

    useToastStore.getState().dismiss();
    expect(useToastStore.getState().visible).toBe(false);
  });

  it('③ Calling show() twice overwrites state (last-write-wins, no queue)', () => {
    useToastStore.getState().show('First message', 'info');
    useToastStore.getState().show('Second message', 'error');

    const state = useToastStore.getState();
    expect(state.visible).toBe(true);
    expect(state.message).toBe('Second message');
    expect(state.type).toBe('error');
  });
});
