import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const HELP_CONTENT_VERSION = '1';
export const HELP_DISMISSAL_KEY = 'nello:help-dismissed-version';

function currentHelpIsDismissed() {
  // GG Hum help dismission should not be permanent....
  try {
    return localStorage.getItem(HELP_DISMISSAL_KEY) === HELP_CONTENT_VERSION;
  } catch {
    return false;
  }
}

export function HelpBox() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(currentHelpIsDismissed);
  const helpItems = t('help.items', { returnObjects: true }) as string[];

  const dismiss = () => {
    setDismissed(true);    
    try {
      localStorage.setItem(HELP_DISMISSAL_KEY, HELP_CONTENT_VERSION);
    } catch {
      // The in-memory state still keeps the box hidden for this visit.
    }
  };

  if (dismissed) return null;

  return (
    <aside className="help-box" aria-labelledby="help-box-title">
      <div className="help-box-header">
        <h2 id="help-box-title">{t('help.title')}</h2>
        <button
          type="button"
          className="help-box-close"
          aria-label={t('help.dismissAria')}
          onClick={dismiss}
        >
          ×
        </button>
      </div>
      <ul className="help-box-list">
        {helpItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}
