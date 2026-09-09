import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserMenu } from './UserMenu';
import * as AuthContext from '../state/AuthContext';

vi.mock('../state/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockApiDispatch = vi.fn();
const mockExportBoard = vi.fn();
const mockState = {
  activeBoardId: 'b-1' as string | null,
  boards: {
    'b-1': { id: 'b-1', name: 'Board', background: null, listIds: [] },
  },
};

vi.mock('../state/StoreContext', () => ({
  useStore: () => ({
    state: mockState,
    apiDispatch: mockApiDispatch,
    exportBoard: mockExportBoard,
  }),
}));

describe('UserMenu', () => {
  const mockOnSettingsClick = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (AuthContext.useAuth as any).mockReturnValue({
      logout: mockLogout,
    });
    mockApiDispatch.mockClear();
    mockState.activeBoardId = 'b-1';
    mockState.boards['b-1'].background = null;
  });

  it('renders closed by default', () => {
    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);
    expect(screen.getByRole('button', { name: 'User Menu' })).toBeTruthy();
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('opens menu on click and handles settings click', () => {
    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);

    // Open menu
    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));

    const settingsBtn = screen.getByRole('button', { name: /Settings$/ });
    expect(settingsBtn).toBeTruthy();

    // Click settings
    fireEvent.click(settingsBtn);
    expect(mockOnSettingsClick).toHaveBeenCalledTimes(1);

    // Menu should close
    expect(screen.queryByRole('button', { name: /Settings$/ })).toBeNull();
  });

  it('handles logout click', () => {
    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));
    fireEvent.click(screen.getByText('Logout'));
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('places board background selection above Settings', () => {
    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));
    const menuItems = screen.getAllByRole('button').map((button) => button.textContent);
    expect(menuItems.indexOf('Board background')).toBeLessThan(menuItems.findIndex((item) => item?.endsWith('Settings')));

    fireEvent.click(screen.getByRole('button', { name: 'Board background' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Sea' }));

    expect(mockApiDispatch).toHaveBeenCalledWith({ type: 'board/background', boardId: 'b-1', background: 'sea' });
  });

  it('hides Export board when there is no active board', () => {
    mockState.activeBoardId = null;
    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));
    expect(screen.queryByText('Export board')).toBeNull();
  });

  it('places Export board immediately above Logout', () => {
    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));
    const menuItems = screen.getAllByRole('button').map((button) => button.textContent);
    expect(menuItems.indexOf('Export board')).toBeLessThan(menuItems.indexOf('Logout'));
  });

  it('exports the active board with a sanitized file name', async () => {
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: vi.fn(() => 'blob:board'),
      revokeObjectURL: vi.fn(),
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild');

    mockExportBoard.mockResolvedValue({
      id: 'b-1',
      name: 'Sprint Planning$',
      lists: [],
    });

    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));
    fireEvent.click(screen.getByText('Export board'));

    // wait for async export + download side effects
    await vi.waitFor(() => expect(mockExportBoard).toHaveBeenCalledWith('b-1'));
    await vi.waitFor(() => expect(vi.mocked(URL.createObjectURL)).toHaveBeenCalled());

    const anchor = appendSpy.mock.calls.find((call) => (call[0] as Element).tagName === 'A')?.[0] as HTMLAnchorElement;
    expect(anchor.tagName).toBe('A');
    expect(anchor.download).toBe('Sprint-Planning.json');
    expect(anchor.href).toBe('blob:board');

    expect(vi.mocked(URL.revokeObjectURL)).toHaveBeenCalledWith('blob:board');
  });

  it('does not attempt to download when export fails', async () => {
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: vi.fn(() => 'blob:board'),
      revokeObjectURL: vi.fn(),
    });
    mockExportBoard.mockResolvedValue(null);

    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));
    fireEvent.click(screen.getByText('Export board'));

    await vi.waitFor(() => expect(mockExportBoard).toHaveBeenCalledWith('b-1'));
    expect(vi.mocked(URL.createObjectURL)).not.toHaveBeenCalled();
    expect(vi.mocked(URL.revokeObjectURL)).not.toHaveBeenCalled();
  });

  it('falls back to board.json for degenerate board names', async () => {
    vi.stubGlobal('URL', {
      ...globalThis.URL,
      createObjectURL: vi.fn(() => 'blob:board'),
      revokeObjectURL: vi.fn(),
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild');

    mockExportBoard.mockResolvedValue({
      id: 'b-1',
      name: '!!!',
      lists: [],
    });

    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));
    fireEvent.click(screen.getByText('Export board'));

    await vi.waitFor(() => expect(mockExportBoard).toHaveBeenCalledWith('b-1'));

    const anchor = appendSpy.mock.calls.find((call) => (call[0] as Element).tagName === 'A')?.[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('board.json');
  });
});
