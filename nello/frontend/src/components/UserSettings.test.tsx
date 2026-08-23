import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserSettings } from './UserSettings';
import * as AuthContext from '../state/AuthContext';
import * as api from '../api';

vi.mock('../state/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('UserSettings', () => {
  const mockOnBack = vi.fn();
  let fetchMock: any;
  const tierResponse = () => ({
    ok: true,
    json: async () => ({
      name: 'free',
      boards: { used: 2, limit: 3 },
      listsPerBoardLimit: 12,
      cardsPerListLimit: 48,
    }),
  });

  beforeEach(() => {
    vi.resetAllMocks();
    (AuthContext.useAuth as any).mockReturnValue({
      token: 'fake-token',
    });
    api.setToken('fake-token');
    fetchMock = vi.fn();
    fetchMock.mockResolvedValue(tierResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  it('renders the form correctly', () => {
    render(<UserSettings onBack={mockOnBack} />);
    fireEvent.click(screen.getByRole('tab', {name: 'Password'}));
    expect(screen.getByText('User Settings')).toBeTruthy();
    expect(screen.getByLabelText('Current Password')).toBeTruthy();
    expect(screen.getByLabelText('New Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back to Board' })).toBeTruthy();
  });

  it('calls onBack when back button is clicked', () => {
    render(<UserSettings onBack={mockOnBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to Board' }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('loads and renders tier limits in the Limits tab', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ name: 'free', boards: { used: 2, limit: 3 }, listsPerBoardLimit: 12, cardsPerListLimit: 48 }) });
    render(<UserSettings onBack={mockOnBack} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Tier Limits' }));

    expect(await screen.findByText('Nello offers different tiers. Below are your current tier limits and features.')).toBeTruthy();
    expect(await screen.findByText('free')).toBeTruthy();
    expect(screen.getByText('2/3')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('48')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/tier', expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.any(String) }) }));
  });

  it('shows error if new password is too short', async () => {
    render(<UserSettings onBack={mockOnBack} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Password' }));

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldpass12345' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'short' } });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByText('New password must be at least 12 characters long')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalledWith('/api/auth/password', expect.anything());
  });

  it('calls API and shows success on successful password change', async () => {
    fetchMock
      .mockResolvedValueOnce(tierResponse())
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ detail: 'Password updated successfully' }),
      });

    render(<UserSettings onBack={mockOnBack} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Password' }));

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'oldpass12345' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newlongpassword123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/password', expect.objectContaining({
      method: 'PUT',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        Authorization: expect.any(String),
      }),
      body: JSON.stringify({ currentPassword: 'oldpass12345', newPassword: 'newlongpassword123' }),
    }));

    expect(await screen.findByText('Password changed successfully')).toBeTruthy();
  });

  it('shows error from API on failure', async () => {
    fetchMock
      .mockResolvedValueOnce(tierResponse())
      .mockResolvedValueOnce({
        ok: false,
        text: async () => JSON.stringify({
          detail: 'Invalid current password',
          error_code: 'PASSWORD_CHANGE_CURRENT_INVALID',
        }),
      });

    render(<UserSettings onBack={mockOnBack} />);
    fireEvent.click(screen.getByRole('tab', {name: 'Password'}));

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'newlongpassword123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByText('Invalid current password')).toBeTruthy();
  });
});
