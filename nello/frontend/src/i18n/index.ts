import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  resources,
} from './resources';

function isSupportedLocale(value: string | null): value is SupportedLocale {
  return !!value && SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

function detectInitialLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSupportedLocale(saved)) return saved;
  } catch {
    // Ignore storage failures and use fallback detection.
  }

  const browserLang = navigator.language?.toLowerCase() ?? '';
  if (browserLang.startsWith('it')) return 'it';
  return DEFAULT_LOCALE;
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: detectInitialLocale(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false,
    },
  });

  i18n.on('languageChanged', (lang) => {
    if (!isSupportedLocale(lang)) return;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures; language remains active in-memory.
    }
  });
}

export default i18n;
