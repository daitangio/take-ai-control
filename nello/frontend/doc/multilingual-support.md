# Multilingual support in Nello frontend

This frontend uses **i18next + react-i18next** with:

- default locale: `en`
- supported locales: `en`, `it`
- fallback locale: `en`
- persisted user choice: `localStorage["nello:locale"]`

Core files:

- `src/i18n/index.ts` — i18n initialization, locale detection, persistence
- `src/i18n/resources.ts` — translation resources (`en`, `it`)
- `src/i18n/backendErrors.ts` — backend `error_code` to localized message flow
- `src/components/LanguageSelector.tsx` — runtime locale switch UI

## How to add a new language

1. Add the locale code to `SUPPORTED_LOCALES` in `src/i18n/resources.ts`.
2. Add a new top-level locale object in `resources` (same key structure as `en`).
3. Translate all UI keys (labels, placeholders, buttons, dialogs, help text).
4. Translate backend error-code messages under `errors.backend.*`.
5. Keep `en` complete; missing keys in the new locale will fallback to `en`.
6. Verify the language switcher exposes the new locale label.
7. Run tests and build:
   - `rtk npm run test`
   - `rtk npm run build`

## Backend error-code taxonomy and mapping convention

Backend errors consumed by frontend must return:

```json
{
  "error_code": "SOME_STABLE_CODE",
  "detail": "human-readable detail"
}
```

Frontend mapping rules:

1. `error_code` maps to i18n key: `errors.backend.<ERROR_CODE>`.
2. If key is missing in active locale, i18next falls back to `en`.
3. If code is unknown (or missing), frontend shows localized generic fallback (`errors.generic`), not raw backend text.

Current canonical code groups:

- Auth/session: `AUTH_*`, `PASSWORD_CHANGE_*`
- Registration: `REGISTER_*`
- Board/list/card domain: `BOARD_*`, `LIST_*`, `CARD_*`
- Membership: `MEMBER_*`
- Runtime protection: `SERVICE_UNDER_PRESSURE`

When introducing a new backend failure class:

1. Add a new stable backend `error_code`.
2. Add its `en` translation under `errors.backend.<ERROR_CODE>`.
3. Add corresponding translations for each supported locale.
4. Add/adjust tests for API response code and localized frontend rendering.
