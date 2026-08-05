## Why

The nello frontend currently hard-codes all user-facing text in English inside JSX. This excludes non-English speakers (starting with the project's Italian users) and makes future localization impossible without invasive rewrites. Introducing an i18n framework now, while the UI surface is still compact, keeps the migration cheap and establishes a repeatable pattern for adding languages.

## What Changes

- Add the Lingui (`@lingui/*`) i18n toolchain to `nello/frontend` (macro-based message extraction, catalog compilation, Vite plugin).
- Wrap the app in an `I18nProvider` and load the active locale at startup, defaulting to English with Italian (`it`) as the first additional language.
- Extract all user-facing strings in components into Lingui messages and provide Italian translations.
- Persist and expose a language selector so users can switch between English and Italian; the choice survives reloads.
- Add npm scripts to extract and compile message catalogs, and wire catalog compilation into the build.
- Add `nello/frontend/doc/multilingual-support.md` documenting the workflow for adding a new language.

## Capabilities

### New Capabilities
- `frontend-internationalization`: The frontend loads a locale-specific message catalog, renders all user-facing text through the i18n layer, lets the user switch language with a persisted preference, and defines the process for adding new languages.

### Modified Capabilities
<!-- None: no existing spec's required behavior changes; strings move behind i18n without altering functional requirements. -->

## Impact

- `nello/frontend/package.json`: new `@lingui/*` dependencies, `lingui.config.ts`, extract/compile scripts.
- `nello/frontend/vite.config.ts`: add the Lingui Vite/babel macro plugin.
- `nello/frontend/src/`: `main.tsx` (provider + locale bootstrap), all components with literal strings, a new locale/i18n module, message catalogs under `src/locales/{en,it}/`.
- New doc: `nello/frontend/doc/multilingual-support.md`.
- No backend changes; no API contract changes.
