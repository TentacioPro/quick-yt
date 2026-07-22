import React from 'react';
import { render } from '@testing-library/react-native';
import { MetricsScreen } from '../../src/ui/MetricsScreen';
import { PaperProvider } from 'react-native-paper';

describe('MetricsScreen UI', () => {
  it('renders the core metrics widgets', () => {
    const { getByText } = render(
      <PaperProvider>
        <MetricsScreen />
      </PaperProvider>
    );

    expect(getByText('Total Videos Indexed')).toBeTruthy();
    expect(getByText('Storage Used')).toBeTruthy();
    expect(getByText('Pending Transcripts')).toBeTruthy();
  });
});
