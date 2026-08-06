import { useState } from 'react';
import { useLingui } from '@lingui/macro';
import { useAuth } from '../state/AuthContext';
import { dynamicActivate, getStoredLocale, isLocale, setStoredLocale } from '../i18n';

interface UserSettingsProps {
  onBack: () => void;
}

export function UserSettings({ onBack }: UserSettingsProps) {
  const { t } = useLingui();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 12) {
      setError(t`New password must be at least 12 characters long`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || t`Failed to change password`);
      }

      setSuccess(t`Password changed successfully`);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t`An error occurred`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-settings-container">
      <h2 className="user-settings-title">{t`User Settings`}</h2>

      <div className="settings-form">
        <h3>{t`Language`}</h3>
        <div className="settings-form-group">
          <label htmlFor="language">{t`Interface language`}</label>
          <select
            id="language"
            value={getStoredLocale()}
            onChange={async (event) => {
              if (!isLocale(event.target.value)) return;
              setStoredLocale(event.target.value);
              await dynamicActivate(event.target.value);
            }}
          >
            <option value="en">{t`English`}</option>
            <option value="it">{t`Italian`}</option>
          </select>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="settings-form">
        <h3>{t`Change Password`}</h3>
        
        {error && <div className="settings-error">{error}</div>}
        {success && <div className="settings-success">{success}</div>}

        <div className="settings-form-group">
          <label htmlFor="currentPassword">{t`Current Password`}</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="settings-form-group">
          <label htmlFor="newPassword">{t`New Password`}</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={12}
          />
          <small>{t`Minimum 12 characters`}</small>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t`Changing...` : t`Change Password`}
          </button>
          <button type="button" className="btn-secondary" onClick={onBack}>
            {t`Back to Board`}
          </button>
        </div>
      </form>
    </div>
  );
}
