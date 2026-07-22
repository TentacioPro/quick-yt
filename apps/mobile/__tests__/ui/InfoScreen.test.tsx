import React from 'react';
import { render } from '@testing-library/react-native';
import { InfoScreen } from '../../src/ui/InfoScreen';
import { PaperProvider } from 'react-native-paper';
import { EditorialTheme } from '../../src/ui/Theme';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider theme={EditorialTheme}>{component}</PaperProvider>);
};

describe('InfoScreen', () => {
  it('renders info text elements', () => {
    const { getByText } = renderWithTheme(<InfoScreen />);

    expect(getByText('Info')).toBeTruthy();
    expect(getByText(/Quick‑YT is an editorial‑archive style video indexing app/)).toBeTruthy();
    expect(getByText(/- Video ingestion with language selection/)).toBeTruthy();
  });
});
