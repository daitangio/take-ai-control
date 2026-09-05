# multilingual-support Specification

## Purpose

Enable users to use the Nello frontend in multiple languages by introducing localized UI text, a persisted locale preference, and a safe fallback when translations are incomplete.

## Requirements

### Requirement: User-selectable frontend language
The frontend SHALL allow users to select a UI language from the supported locale list through a polished, compact selector that uses recognizable locale flags, clearly indicates the active language, exposes an accessible text label, and SHALL apply the selected language to visible UI text without requiring a new login.

#### Scenario: User changes language during a session
- **WHEN** an authenticated user selects Italian from the language selector
- **THEN** the visible frontend UI strings are rendered in Italian for the current session

#### Scenario: Language selector communicates supported locales
- **WHEN** a user views the language selector
- **THEN** the selector presents the supported locales with recognizable English and Italian flags, identifies the active locale, and remains operable by keyboard and assistive technology

### Requirement: Persisted locale preference
The frontend SHALL persist the user's selected locale in browser storage and SHALL restore that locale on subsequent page loads.

#### Scenario: Locale persists across reload
- **WHEN** a user selects a supported language and reloads the application
- **THEN** the frontend initializes in the previously selected language

### Requirement: Italian locale support
The frontend SHALL include a complete Italian translation resource for all user-facing application-owned UI strings that are rendered by the current frontend screens.

#### Scenario: Italian translations exist for application text
- **WHEN** the active locale is Italian
- **THEN** the user-facing frontend labels, buttons, placeholders, and helper copy are rendered from Italian translations

### Requirement: Translation fallback behavior
The frontend SHALL fall back to the default locale when a translation key is missing in the active locale.

#### Scenario: Missing key falls back to default locale
- **WHEN** a translation key does not exist in the active locale dictionary
- **THEN** the frontend renders the corresponding default-locale value instead of failing UI rendering

### Requirement: Backend error localization by error code
The frontend SHALL localize backend-originated errors using a stable backend `error_code` field and locale dictionaries instead of rendering raw backend error text directly.

#### Scenario: Known backend error code is localized
- **WHEN** the backend responds with a recognized `error_code` and the active locale is Italian
- **THEN** the frontend renders the corresponding Italian localized error message

#### Scenario: Unknown backend error code uses fallback
- **WHEN** the backend responds with an unrecognized or missing `error_code`
- **THEN** the frontend renders a safe default localized generic error message

### Requirement: Localized capacity feedback

The frontend SHALL localize capacity-threshold warnings and board, list, and card capacity-limit errors in every supported locale.

#### Scenario: Capacity warning is localized

- **WHEN** a user's capacity reaches the warning threshold while a non-default locale is active
- **THEN** the capacity warning is rendered in that locale with the current usage and limit

#### Scenario: Capacity error is localized

- **WHEN** the API returns a recognized capacity-limit error code while a non-default locale is active
- **THEN** the frontend renders the corresponding localized capacity-limit message
