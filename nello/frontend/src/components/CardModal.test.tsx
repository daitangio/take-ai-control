import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardModal } from './CardModal';

const mockApiDispatch = vi.fn().mockResolvedValue(undefined);
const mockDispatch = vi.fn();

const mockState = {
  boards: {},
  lists: {},
  cards: {} as Record<string, { id: string; title: string; description: string }>,
  activeBoardId: null,
};

vi.mock('../state/StoreContext', () => ({
  useStore: () => ({
    state: mockState,
    dispatch: mockDispatch,
    apiDispatch: mockApiDispatch,
    loadBoards: vi.fn(),
    toast: null,
    clearToast: vi.fn(),
  }),
}));

beforeEach(() => {
  mockApiDispatch.mockClear();
  mockState.cards = {
    'c-1': { id: 'c-1', title: 'Test Card', description: 'Some desc' },
  };
});

describe('CardModal dirty check', () => {
  it('does NOT call apiDispatch when closed without edits', () => {
    const onClose = vi.fn();
    render(<CardModal cardId="c-1" onClose={onClose} />);

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);

    expect(mockApiDispatch).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls apiDispatch when title is changed', () => {
    const onClose = vi.fn();
    render(<CardModal cardId="c-1" onClose={onClose} />);

    const titleInput = screen.getByPlaceholderText('Card title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.click(screen.getByText('Close'));

    expect(mockApiDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'card/edit',
        cardId: 'c-1',
        title: 'New Title',
        description: 'Some desc',
      }),
    );
  });

  it('calls apiDispatch when description is changed', () => {
    const onClose = vi.fn();
    render(<CardModal cardId="c-1" onClose={onClose} />);

    const descInput = screen.getByPlaceholderText('Add a description...');
    fireEvent.change(descInput, { target: { value: 'Updated desc' } });
    fireEvent.click(screen.getByText('Close'));

    expect(mockApiDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'card/edit',
        cardId: 'c-1',
        title: 'Test Card',
        description: 'Updated desc',
      }),
    );
  });
});
