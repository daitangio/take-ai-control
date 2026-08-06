## Why

The Nello frontend currently hardcodes UI copy in English across components, which prevents users from working in their preferred language. We need multilingual support now to enable Italian users and to establish a repeatable pattern for future language additions.

## What Changes

- Introduce a frontend i18n library integration and a shared translation architecture for Nello UI strings.
- Add Italian (`it`) translations for the current user-facing frontend text.
- Add locale selection and persistence in the frontend so the chosen language survives page reloads.
- Standardize backend error responses with stable `error_code` values that the frontend can localize consistently across supported languages.
- Add contributor documentation at `nello/frontend/doc/multilingual-support.md` describing how to add a new language and maintain translation files.

## Capabilities

### New Capabilities
- `multilingual-support`: Provide localized UI text in the Nello frontend, including language selection, translation lookup, and fallback behavior.

### Modified Capabilities
- `responsive-user-interface`: UI controls and labels are rendered from localized resources rather than fixed English strings.
- `backend-api`: Error responses expose stable, documented `error_code` values for frontend localization.

## Impact

- Affected code: `nello/frontend/src` components, shared UI state/providers, frontend tests, backend API error payload handling, and new i18n resource files.
- Documentation: new `nello/frontend/doc/multilingual-support.md`.
- Dependencies: one frontend i18n library will be added to `nello/frontend/package.json`.
