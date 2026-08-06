## 1. Toolchain setup

- [x] 1.1 Add `@lingui/core`, `@lingui/react`, `@lingui/macro`, `@lingui/cli`, `@lingui/vite-plugin`, and `@lingui/babel-plugin-lingui-macro` to `nello/frontend/package.json` (pinned to a single matching major version)
- [x] 1.2 Create `nello/frontend/lingui.config.ts` with `locales: ["en", "it"]`, `sourceLocale: "en"`, `po` format, and catalog path `src/locales/{locale}/messages`
- [x] 1.3 Add `extract` (`lingui extract`) and `compile` (`lingui compile`) npm scripts, and run `compile` as part of `build`
- [x] 1.4 Wire `@lingui/vite-plugin` and the Lingui babel macro into `@vitejs/plugin-react` in `nello/frontend/vite.config.ts` (ensure vitest still uses the same config)

## 2. i18n runtime

- [x] 2.1 Create `src/i18n.ts` exposing `dynamicActivate(locale)` that dynamically imports the compiled catalog and calls `i18n.load`/`i18n.activate`, plus helpers to read/write the persisted locale in `localStorage` (key `nello.locale`, default `en`)
- [x] 2.2 In `src/main.tsx`, activate the stored (or default) locale before first render and wrap `<App/>` in `<I18nProvider i18n={i18n}>`

## 3. String extraction

- [x] 3.1 Replace hard-coded user-facing literals with `Trans`/`t` macros across `src/App.tsx` and all `src/components/*.tsx` (login/register, board, list, card, dialogs, menus, settings, help, empty states)
- [x] 3.2 Run `lingui extract` and confirm the generated `src/locales/en/messages.po` covers the app's strings with no unexpected empties

## 4. Italian translations

- [x] 4.1 Provide Italian translations for all extracted messages in `src/locales/it/messages.po`
- [x] 4.2 Run `lingui compile` and verify compiled catalogs exist for `en` and `it`

## 5. Language selector

- [x] 5.1 Add a language selector (English / Italian) to the existing `UserMenu`/`UserSettings` surface that calls `dynamicActivate` and persists the choice, updating the UI without a manual reload
- [x] 5.2 Verify the selected language is reapplied on reload from the persisted preference

## 6. Documentation & verification

- [x] 6.1 Write `nello/frontend/doc/multilingual-support.md` explaining the architecture and the step-by-step process to add a new language (register locale, extract, translate, compile)
- [x] 6.2 Run `rtk npm run build` (in `nello/frontend`) and `npm run test`; fix any failures so the build and tests pass
