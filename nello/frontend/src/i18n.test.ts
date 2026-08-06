import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dynamicActivate,
  getStoredLocale,
  i18n,
  setStoredLocale,
} from './i18n';

describe('i18n locale preference', () => {
  const values = new Map<string, string>();

  beforeEach(async () => {
    values.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    await dynamicActivate('en');
  });

  it('defaults to English and reapplies a persisted locale', () => {
    expect(getStoredLocale()).toBe('en');
    setStoredLocale('it');
    expect(getStoredLocale()).toBe('it');
  });

  it('activates translated catalogs without a reload', async () => {
    await dynamicActivate('it');
    expect(i18n.locale).toBe('it');
    const settingsId = Object.keys(i18n.messages).find((id) =>
      JSON.stringify(i18n.messages[id]).includes('Impostazioni'),
    );
    expect(settingsId).toBeDefined();
    expect(i18n._(settingsId!)).toBe('Impostazioni');

    await dynamicActivate('en');
    expect(i18n._(settingsId!)).toBe('Settings');
  });
});
