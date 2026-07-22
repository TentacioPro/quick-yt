import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DashboardScreen } from '../../src/ui/DashboardScreen';
import { PaperProvider } from 'react-native-paper';
import { EditorialTheme } from '../../src/ui/Theme';

const mockVideoList = [
  { id: '1', title: 'Test Video', url: 'https://youtu.be/test', status: 'complete' as const },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider theme={EditorialTheme}>{component}</PaperProvider>);
};

describe('DashboardScreen', () => {
  it('renders correctly with required elements', () => {
    const { getByText, getByPlaceholderText, getByRole } = renderWithTheme(
      <DashboardScreen
        videoList={mockVideoList}
        syncStatus="Connected"
        lastSynced="12:00 PM"
        onSync={jest.fn()}
        onIngest={jest.fn()}
      />
    );

    // Verify presence of structural sections
    expect(getByText('Document Ingestion')).toBeTruthy();
    expect(getByText('Indexed Registry')).toBeTruthy();
    
    // Verify list rendering
    expect(getByText('Test Video')).toBeTruthy();
    
    // Verify inputs/buttons
    expect(getByPlaceholderText('Enter YouTube Video URL...')).toBeTruthy();
    expect(getByRole('button', { name: 'Add to Index' })).toBeTruthy();
    expect(getByRole('button', { name: 'Sync Registry with Remote Host' })).toBeTruthy();
  });

  it('triggers onIngest when Add to Index is pressed', () => {
    const mockOnIngest = jest.fn();
    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <DashboardScreen
        videoList={[]}
        syncStatus="Connected"
        lastSynced="12:00 PM"
        onSync={jest.fn()}
        onIngest={mockOnIngest}
      />
    );

    const input = getByPlaceholderText('Enter YouTube Video URL...');
    const ingestBtn = getByRole('button', { name: 'Add to Index' });

    fireEvent.changeText(input, 'https://youtu.be/newvid');
    fireEvent.press(ingestBtn);

    expect(mockOnIngest).toHaveBeenCalledWith('https://youtu.be/newvid', 'en');
  });
});
