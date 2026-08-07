## 1. i18n Foundation

- [x] 1.1 Add and configure the frontend i18n library in `nello/frontend` bootstrap with default locale `en` and fallback to `en`.
- [x] 1.2 Create translation resource structure for `en` and `it` with stable key naming conventions.
- [x] 1.3 Add locale state management and persistence (read/write selected locale in browser storage).

## 2. Backend Error-Code Contract

- [x] 2.1 Define the canonical backend `error_code` set needed by current frontend auth/settings/board flows.
- [x] 2.2 Update backend error responses in those flows to include stable `error_code` fields while preserving status-code behavior.
- [x] 2.3 Add backend tests that assert `error_code` presence and expected values on representative error paths.

## 3. UI Localization Migration

- [x] 3.1 Refactor authenticated and unauthenticated UI components to consume translation keys instead of hardcoded strings.
- [x] 3.2 Add a polished, compact flag-based language selector in the frontend UI, with English/Italian flags, active-language indication, accessible naming, and runtime language switching.
- [x] 3.3 Route backend errors through `error_code`-to-translation-key mapping with generic localized fallback for unknown codes.
- [x] 3.4 Ensure localized labels preserve responsive behavior at existing phone/tablet/desktop breakpoints.

## 4. Italian Translation Coverage

- [x] 4.1 Add Italian translations for current frontend-owned labels, buttons, placeholders, helper text, and dialog copy.
- [x] 4.2 Add Italian translations for mapped backend `error_code` messages used by current frontend flows.
- [x] 4.3 Verify translation fallback behavior by leaving a controlled missing key case and confirming English fallback renders.

## 5. Documentation and Validation

- [x] 5.1 Create `nello/frontend/doc/multilingual-support.md` documenting how to add a new language, where keys live, and validation expectations.
- [x] 5.2 Document the backend `error_code` taxonomy and frontend mapping conventions in change artifacts.
- [x] 5.3 Update frontend tests to use deterministic locale setup and add/adjust unit tests for locale switching, fallback behavior, and localized backend errors.
- [x] 5.4 Run backend tests for error-code responses and frontend unit tests for localized UI behavior.
- [x] 5.5 Run `rtk npm run build` in `nello/frontend` and confirm localized UI still builds cleanly.
- [x] 5.6 Human test: switch between English and Italian using the flag-based selector, confirm the active flag and accessible name, trigger representative backend errors, reload, and confirm persisted locale plus localized error messages and responsive keyboard/mouse usability.
