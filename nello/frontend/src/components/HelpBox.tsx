import { useState } from 'react';

export const HELP_CONTENT_VERSION = '1';
export const HELP_DISMISSAL_KEY = 'nello:help-dismissed-version';

const helpItems = [  
  'Nello loves friends: create a shared board by ending its name with $. That suffix is permanent.',
  'On a shared board you own, use the 👤 button to invite or remove members.',
  'Nello is in beta and it is self explanatory'
];

function currentHelpIsDismissed() {
  // GG Hum help dismission should not be permanent....
  try {
    return localStorage.getItem(HELP_DISMISSAL_KEY) === HELP_CONTENT_VERSION;
  } catch {
    return false;
  }
}

export function HelpBox() {
  const [dismissed, setDismissed] = useState(currentHelpIsDismissed);

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
        <h2 id="help-box-title">Nello non-invasive help</h2>
        <button
          type="button"
          className="help-box-close"
          aria-label="Dismiss help"
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
