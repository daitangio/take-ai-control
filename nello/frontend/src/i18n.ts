import { i18n } from '@lingui/core'

export const locales = ['en', 'it'] as const
export type Locale = (typeof locales)[number]

const storageKey = 'nello.locale'
const defaultLocale: Locale = 'en'

export function isLocale(locale: string): locale is Locale {
  return locales.some((candidate) => candidate === locale)
}

export function getStoredLocale(): Locale {
  try {
    const locale = globalThis.localStorage?.getItem(storageKey)
    return locale && isLocale(locale) ? locale : defaultLocale
  } catch {
    return defaultLocale
  }
}

export function setStoredLocale(locale: Locale) {
  try {
    globalThis.localStorage?.setItem(storageKey, locale)
  } catch {
    // Keep the active in-memory locale when storage is unavailable.
  }
}

export async function dynamicActivate(locale: Locale) {
  const { messages } = await import(`./locales/${locale}/messages.po`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}

export { i18n }
