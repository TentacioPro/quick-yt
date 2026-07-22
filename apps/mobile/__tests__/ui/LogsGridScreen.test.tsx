import React from 'react';
import { render } from '@testing-library/react-native';
import { LogsGridScreen } from '../../src/ui/LogsGridScreen';
import { PaperProvider } from 'react-native-paper';

describe('LogsGridScreen UI', () => {
  it('renders a data table containing audit logs', () => {
    const { getByText } = render(
      <PaperProvider>
        <LogsGridScreen />
      </PaperProvider>
    );

    // Initial table header assertions
    expect(getByText('Action')).toBeTruthy();
    expect(getByText('Status')).toBeTruthy();
    expect(getByText('Timestamp')).toBeTruthy();
  });
});
