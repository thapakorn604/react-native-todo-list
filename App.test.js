import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import App from './App';
import * as LocalAuthentication from 'expo-local-authentication';

// Place the mock for the `expo-local-authentication` module here, at the top of the test file.
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true, warning: 'mocked', error: null })),
}));

describe('App', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure a clean state
    jest.clearAllMocks();
  });

  it('renders the main title', async () => {
    // Wait for useEffect to finish its async calls
    await waitFor(() => render(<App />));
    const titleElement = screen.getByText('My TODO List');
    expect(titleElement).toBeOnTheScreen();
  });

  it('adds a new todo item after successful authentication', async () => {
    await waitFor(() => render(<App />));

    // Verify the initial state
    expect(screen.queryByText('Test Todo')).not.toBeOnTheScreen();

    const newTodoInput = screen.getByPlaceholderText('Enter a new TODO');
    const addButton = screen.getByText('Add');

    // Simulate user input and button press
    fireEvent.changeText(newTodoInput, 'Test Todo');
    fireEvent.press(addButton);

    // Wait for the asynchronous authentication to complete
    await waitFor(() => expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1));

    // Check if the todo item is now on the screen
    expect(screen.getByText('Test Todo')).toBeOnTheScreen();
  });

  it('toggles a todo item as completed after successful authentication', async () => {
    await waitFor(() => render(<App />));

    // Add a todo item first
    const newTodoInput = screen.getByPlaceholderText('Enter a new TODO');
    const addButton = screen.getByText('Add');
    fireEvent.changeText(newTodoInput, 'To be toggled');
    fireEvent.press(addButton);

    await waitFor(() => expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1));
    const todoItem = screen.getByText('To be toggled');
    expect(todoItem).not.toHaveStyle({
      textDecorationLine: 'line-through',
    });

    // Simulate press to toggle the item
    fireEvent.press(todoItem);

    await waitFor(() => expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(2));
    expect(todoItem).toHaveStyle({
      textDecorationLine: 'line-through',
    });
  });

  it('deletes a todo item after successful authentication', async () => {
    await waitFor(() => render(<App />));

    // Add a todo item first
    const newTodoInput = screen.getByPlaceholderText('Enter a new TODO');
    const addButton = screen.getByText('Add');
    fireEvent.changeText(newTodoInput, 'To be deleted');
    fireEvent.press(addButton);

    await waitFor(() => expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(1));
    expect(screen.getByText('To be deleted')).toBeOnTheScreen();

    // Find and press the delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.press(deleteButton);

    await waitFor(() => expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('To be deleted')).not.toBeOnTheScreen();
  });
});