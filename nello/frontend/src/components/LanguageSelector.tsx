import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../i18n/resources';

const LOCALE_OPTIONS: Array<{ locale: SupportedLocale; flag: string; labelKey: 'english' | 'italian' }> = [
  { locale: 'en', flag: '🇬🇧', labelKey: 'english' },
  { locale: 'it', flag: '🇮🇹', labelKey: 'italian' },
];

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const activeLanguage = SUPPORTED_LOCALES.includes(i18n.language as SupportedLocale)
    ? (i18n.language as SupportedLocale)
    : 'en';

  return (
    <label className="language-selector">
      <span className="language-selector-label">{t('language.label')}</span>
      <select
        className="language-select"
        aria-label={t('language.label')}
        value={activeLanguage}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value as SupportedLocale);
        }}
      >
        {LOCALE_OPTIONS.map(({ locale, flag, labelKey }) => {
          const label = t(`language.${labelKey}`);

          return (
            <option
              key={locale}
              value={locale}
              title={label}
            >
              {flag}
            </option>
          );
        })}
      </select>
    </label>
  );
}
