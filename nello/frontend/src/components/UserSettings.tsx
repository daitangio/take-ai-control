import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../state/AuthContext';
import { changePassword } from '../api';
import { toLocalizedErrorMessage } from '../i18n/backendErrors';

interface UserSettingsProps {
  onBack: () => void;
}

export function UserSettings({ onBack }: UserSettingsProps) {
  const { t } = useTranslation();
  useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 12) {
      setError(t('errors.backend.PASSWORD_CHANGE_PASSWORD_INVALID'));
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(t('settings.success'));
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(toLocalizedErrorMessage(t, err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-settings-container">
      <h2 className="user-settings-title">{t('settings.title')}</h2>

      <form onSubmit={handleSubmit} className="settings-form">
        <h3>{t('settings.changePasswordTitle')}</h3>

        {error && <div className="settings-error">{error}</div>}
        {success && <div className="settings-success">{success}</div>}

        <div className="settings-form-group">
          <label htmlFor="currentPassword">{t('settings.currentPassword')}</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="settings-form-group">
          <label htmlFor="newPassword">{t('settings.newPassword')}</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={12}
          />
          <small>{t('settings.minimumLength')}</small>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? t('settings.changing') : t('settings.changePassword')}
          </button>
          <button type="button" className="btn-secondary" onClick={onBack}>
            {t('settings.backToBoard')}
          </button>
        </div>
      </form>
    </div>
  );
}
