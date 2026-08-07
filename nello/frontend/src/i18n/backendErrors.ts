import type { TFunction } from 'i18next';
import { ApiError } from '../api';

function translateBackendErrorCode(t: TFunction, errorCode?: string | null): string | null {
  if (!errorCode) return null;
  const key = `errors.backend.${errorCode}`;
  const translated = t(key);
  return translated === key ? null : translated;
}

export function toLocalizedErrorMessage(
  t: TFunction,
  error: unknown,
  fallbackKey = 'errors.generic',
): string {
  if (typeof error === 'object' && error !== null && 'errorCode' in error) {
    const maybeCode = (error as { errorCode?: string | null }).errorCode;
    const translated = translateBackendErrorCode(t, maybeCode);
    if (translated) return translated;
    return t(fallbackKey);
  }
  if (error instanceof ApiError) {
    const translated = translateBackendErrorCode(t, error.errorCode);
    if (translated) return translated;
    return t(fallbackKey);
  }
  if (error instanceof Error && error.message) return error.message;
  return t(fallbackKey);
}
