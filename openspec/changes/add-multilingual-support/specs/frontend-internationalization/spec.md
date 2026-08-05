## Purpose

Defines how the nello frontend presents all user-facing text in the user's chosen language, so that non-English speakers (initially Italian users) can use the application, and so new languages can be added through a documented, repeatable process.

## ADDED Requirements

### Requirement: User-facing text is rendered through a localization layer

All user-facing text in the frontend SHALL be rendered through the internationalization layer rather than as hard-coded literals, so that the displayed language follows the active locale's message catalog.

#### Scenario: Text follows the active locale

- **WHEN** the active locale is Italian and a screen containing translatable text is displayed
- **THEN** every user-facing string on that screen is shown using its Italian translation from the catalog

#### Scenario: Missing translation falls back to the source text

- **WHEN** the active locale is Italian and a particular message has no Italian translation in the catalog
- **THEN** the application displays the original English source text for that message instead of an error or blank

### Requirement: Default and supported languages

The frontend SHALL default to English and SHALL support at least English (`en`) and Italian (`it`) as selectable languages.

#### Scenario: First visit with no stored preference

- **WHEN** a user opens the application and has no previously stored language preference
- **THEN** the interface is displayed in English

#### Scenario: Italian is available for selection

- **WHEN** a user opens the language selector
- **THEN** both English and Italian are offered as choices

### Requirement: User can switch language

The frontend SHALL provide a control that lets the user switch the interface language, and the change SHALL take effect without requiring a manual page reload.

#### Scenario: Switching to Italian

- **WHEN** a user selects Italian from the language selector
- **THEN** the visible interface text updates to Italian

### Requirement: Language preference persists

The selected language SHALL be persisted on the client and SHALL be reapplied automatically when the user returns to the application.

#### Scenario: Preference survives reload

- **WHEN** a user has selected Italian and then reloads or reopens the application
- **THEN** the interface is displayed in Italian without the user selecting it again

### Requirement: Adding a new language is documented

The repository SHALL include documentation describing the end-to-end process for adding a new language, including how to register the locale, extract messages, provide translations, and compile catalogs.

#### Scenario: Contributor adds a language following the docs

- **WHEN** a contributor follows the multilingual-support documentation to add a new locale
- **THEN** the documented steps are sufficient to make that language selectable and rendered without needing undocumented changes
