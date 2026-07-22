import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileSettingsScreen } from '../../src/ui/ProfileSettingsScreen';
import { PaperProvider } from 'react-native-paper';

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      getBoolean: jest.fn().mockReturnValue(true),
      getString: jest.fn().mockReturnValue('English'),
      getNumber: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
    })),
  };
}, { virtual: true });

describe('ProfileSettingsScreen UI', () => {
  it('renders settings controls for theme, language, and MMKV bindings', () => {
    const { getByText } = render(
      <PaperProvider>
        <ProfileSettingsScreen />
      </PaperProvider>
    );

    expect(getByText('Dark Mode Override')).toBeTruthy();
    expect(getByText('Default Translation Language')).toBeTruthy();
  });
});
