import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ComposeNoteScreen from '../../src/ui/ComposeNoteScreen';

describe('ComposeNoteScreen TDD', () => {
  it('renders input fields and submits valid markdown', async () => {
    const { getByPlaceholderText, getByText } = render(<ComposeNoteScreen />);
    
    const contentInput = getByPlaceholderText(/Write your note/i);
    const submitBtn = getByText('Save Note');

    fireEvent.changeText(contentInput, '## This is an analytical note');
    fireEvent.press(submitBtn);

    await waitFor(() => {
      // Assuming it clears the form on success
      expect(contentInput.props.value).toBe('');
    });
  });

  it('validates required fields using zod', async () => {
    const { getByText, findByText } = render(<ComposeNoteScreen />);
    const submitBtn = getByText('Save Note');
    
    fireEvent.press(submitBtn);
    
    // Zod validation error for empty content
    const errorMsg = await findByText(/Content is required/i);
    expect(errorMsg).toBeTruthy();
  });
});
