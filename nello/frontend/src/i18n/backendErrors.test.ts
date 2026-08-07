import { beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '../api';
import i18n from './index';
import { toLocalizedErrorMessage } from './backendErrors';

describe('i18n backend error localization', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('switches language at runtime', async () => {
    await i18n.changeLanguage('it');
    expect(i18n.t('auth.login')).toBe('Accedi');
  });

  it('falls back to English when the active locale is missing a backend error translation', async () => {
    await i18n.changeLanguage('it');
    const message = toLocalizedErrorMessage(
      i18n.t.bind(i18n),
      new ApiError('backend message', 400, 'TEST_FALLBACK_ONLY'),
    );
    expect(message).toBe('Fallback only message');
  });

  it('returns localized generic fallback for unknown backend error codes', async () => {
    await i18n.changeLanguage('it');
    const message = toLocalizedErrorMessage(
      i18n.t.bind(i18n),
      new ApiError('backend message', 400, 'UNKNOWN_ERROR_CODE'),
    );
    expect(message).toBe('Si è verificato un errore');
  });
});
