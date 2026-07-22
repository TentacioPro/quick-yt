import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../../src/ui/SettingsScreen';
import { PaperProvider } from 'react-native-paper';
import { EditorialTheme } from '../../src/ui/Theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider theme={EditorialTheme}>{component}</PaperProvider>);
};

describe('SettingsScreen', () => {
  it('renders required settings elements', () => {
    const { getByText, getByPlaceholderText, getByRole } = renderWithTheme(<SettingsScreen />);

    // Title and Labels
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('API Key')).toBeTruthy();
    expect(getByText('Language Preference')).toBeTruthy();
    expect(getByText('Dark Theme')).toBeTruthy();

    // Inputs and Toggles
    expect(getByPlaceholderText('Enter Gemini API Key')).toBeTruthy();
    expect(getByText('EN')).toBeTruthy(); // Language button text is uppercase
    expect(getByRole('switch')).toBeTruthy();
  });

  it('updates API key input', () => {
    const { getByPlaceholderText } = renderWithTheme(<SettingsScreen />);
    const input = getByPlaceholderText('Enter Gemini API Key');
    
    fireEvent.changeText(input, 'AIzaSyA...');
    expect(input.props.value).toBe('AIzaSyA...');
  });
});
