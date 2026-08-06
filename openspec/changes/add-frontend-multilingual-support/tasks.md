## 1. i18n Foundation

- [ ] 1.1 Add and configure the frontend i18n library in `nello/frontend` bootstrap with default locale `en` and fallback to `en`.
- [ ] 1.2 Create translation resource structure for `en` and `it` with stable key naming conventions.
- [ ] 1.3 Add locale state management and persistence (read/write selected locale in browser storage).

## 2. Backend Error-Code Contract

- [ ] 2.1 Define the canonical backend `error_code` set needed by current frontend auth/settings/board flows.
- [ ] 2.2 Update backend error responses in those flows to include stable `error_code` fields while preserving status-code behavior.
- [ ] 2.3 Add backend tests that assert `error_code` presence and expected values on representative error paths.

## 3. UI Localization Migration

- [ ] 3.1 Refactor authenticated and unauthenticated UI components to consume translation keys instead of hardcoded strings.
- [ ] 3.2 Add a language selector control in the frontend UI and apply runtime language switching.
- [ ] 3.3 Route backend errors through `error_code`-to-translation-key mapping with generic localized fallback for unknown codes.
- [ ] 3.4 Ensure localized labels preserve responsive behavior at existing phone/tablet/desktop breakpoints.

## 4. Italian Translation Coverage

- [ ] 4.1 Add Italian translations for current frontend-owned labels, buttons, placeholders, helper text, and dialog copy.
- [ ] 4.2 Add Italian translations for mapped backend `error_code` messages used by current frontend flows.
- [ ] 4.3 Verify translation fallback behavior by leaving a controlled missing key case and confirming English fallback renders.

## 5. Documentation and Validation

- [ ] 5.1 Create `nello/frontend/doc/multilingual-support.md` documenting how to add a new language, where keys live, and validation expectations.
- [ ] 5.2 Document the backend `error_code` taxonomy and frontend mapping conventions in change artifacts.
- [ ] 5.3 Update frontend tests to use deterministic locale setup and add/adjust unit tests for locale switching, fallback behavior, and localized backend errors.
- [ ] 5.4 Run backend tests for error-code responses and frontend unit tests for localized UI behavior.
- [ ] 5.5 Run `rtk npm run build` in `nello/frontend` and confirm localized UI still builds cleanly.
- [ ] 5.6 Human test: switch between English and Italian in the running app, trigger representative backend errors, reload, and confirm persisted locale plus localized error messages and responsive control accessibility.
