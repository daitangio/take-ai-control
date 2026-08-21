import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../state/AuthContext';
import { changePassword, getUserTier, type UserTierInfo } from '../api';
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
  const [activeTab, setActiveTab] = useState<'password' | 'limits'>('password');
  const [tier, setTier] = useState<UserTierInfo | null>(null);
  const [tierError, setTierError] = useState('');

  useEffect(() => {
    if (activeTab !== 'limits' || tier) return;
    getUserTier().then(setTier).catch((err) => setTierError(toLocalizedErrorMessage(t, err)));
  }, [activeTab, t, tier]);

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

      <div className="settings-tabs" role="tablist" aria-label={t('settings.title')}>
        <button type="button" role="tab" aria-selected={activeTab === 'limits'} className={activeTab === 'limits' ? 'settings-tab active' : 'settings-tab'} onClick={() => setActiveTab('limits')}>
          {t('settings.limitsTab')}
        </button>
        <button type="button" role="tab" aria-selected={activeTab === 'password'} className={activeTab === 'password' ? 'settings-tab active' : 'settings-tab'} onClick={() => setActiveTab('password')}>
          {t('settings.passwordTab')}
        </button>
      </div>

      {activeTab === 'password' ? <form onSubmit={handleSubmit} className="settings-form">
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
      </form> : <section role="tabpanel" className="settings-limits">
        <h3>{t('settings.limitsTitle')}</h3>
        <p>{t('settings.limitsIntro')}</p>
        {tierError && <div className="settings-error">{tierError}</div>}
        {!tier && !tierError && <p>{t('settings.loading')}</p>}
        {tier && <dl className="settings-limit-list">
          <div><dt>{t('settings.tierName')}</dt><dd>{tier.name}</dd></div>
          <div><dt>{t('settings.boards')}</dt><dd>{tier.boards.used}/{tier.boards.limit}</dd></div>
          <div><dt>{t('settings.listsPerBoard')}</dt><dd>{tier.listsPerBoardLimit}</dd></div>
          <div><dt>{t('settings.cardsPerBoard')}</dt><dd>{tier.cardsPerListLimit}</dd></div>
        </dl>}
        <div className="settings-actions"><button type="button" className="btn-secondary" onClick={onBack}>{t('settings.backToBoard')}</button></div>
      </section>}
    </div>
  );
}
