import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserMenu } from './UserMenu';
import * as AuthContext from '../state/AuthContext';

vi.mock('../state/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('UserMenu', () => {
  const mockOnSettingsClick = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (AuthContext.useAuth as any).mockReturnValue({
      logout: mockLogout,
    });
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
    
    const settingsBtn = screen.getByText('Settings');
    expect(settingsBtn).toBeTruthy();
    
    // Click settings
    fireEvent.click(settingsBtn);
    expect(mockOnSettingsClick).toHaveBeenCalledTimes(1);
    
    // Menu should close
    expect(screen.queryByText('Settings')).toBeNull();
  });

  it('handles logout click', () => {
    render(<UserMenu onSettingsClick={mockOnSettingsClick} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'User Menu' }));
    fireEvent.click(screen.getByText('Logout'));
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
