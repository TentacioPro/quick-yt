import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VideoDetailScreen } from '../../src/ui/VideoDetailScreen';
import { PaperProvider } from 'react-native-paper';
import { EditorialTheme } from '../../src/ui/Theme';

const mockVideo = {
  id: '1',
  title: 'Test Video',
  url: 'https://youtu.be/test',
  status: 'complete' as const,
  transcript: 'This is a test transcript.',
  summary: 'This is a test summary.',
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(<PaperProvider theme={EditorialTheme}>{component}</PaperProvider>);
};

describe('VideoDetailScreen', () => {
  it('renders video details correctly', () => {
    const { getByText } = renderWithTheme(<VideoDetailScreen video={mockVideo} />);

    expect(getByText('Test Video')).toBeTruthy();
    expect(getByText('https://youtu.be/test')).toBeTruthy();
    expect(getByText('Full Transcript')).toBeTruthy();
    expect(getByText('This is a test transcript.')).toBeTruthy();
    expect(getByText('AI Summary')).toBeTruthy();
    expect(getByText('This is a test summary.')).toBeTruthy();
  });

  it('triggers action callbacks', () => {
    const onReIngest = jest.fn();
    const onDelete = jest.fn();
    const onShare = jest.fn();

    const { getByRole } = renderWithTheme(
      <VideoDetailScreen
        video={mockVideo}
        onReIngest={onReIngest}
        onDelete={onDelete}
        onShare={onShare}
      />
    );

    fireEvent.press(getByRole('button', { name: 'Re‑Ingest' }));
    fireEvent.press(getByRole('button', { name: 'Delete' }));
    fireEvent.press(getByRole('button', { name: 'Share' }));

    expect(onReIngest).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
  });
});
