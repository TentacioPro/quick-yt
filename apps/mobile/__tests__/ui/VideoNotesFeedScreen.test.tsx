import React from 'react';
import { render } from '@testing-library/react-native';
import VideoNotesFeedScreen from '../../src/ui/VideoNotesFeedScreen';

describe('VideoNotesFeedScreen TDD', () => {
  it('renders a chronological feed of video notes', () => {
    const { getByText } = render(<VideoNotesFeedScreen />);
    
    // Note 1 - assuming mock data will be supplied
    expect(getByText(/This is the first note/i)).toBeTruthy();
    expect(getByText(/12:44/)).toBeTruthy(); // videoTimestamp format

    // Note 2
    expect(getByText(/This is a later note/i)).toBeTruthy();
  });

  it('renders Analytical Lens tags', () => {
    const { getByText } = render(<VideoNotesFeedScreen />);
    
    expect(getByText('Cinematography')).toBeTruthy();
    expect(getByText('Pacing')).toBeTruthy();
  });
});
