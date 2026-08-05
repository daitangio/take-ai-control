## Context

The nello frontend is a compact React 19 + Vite + TypeScript app (see `nello/frontend/`). All UI strings are currently hard-coded English literals inside ~20 component files (`src/components/*.tsx`, `src/App.tsx`). There is no i18n layer today. See `proposal.md` (Why) for motivation. The user requested Lingui (https://lingui.dev/tutorials/react) as the framework and Italian as the first target language.

## Goals / Non-Goals

**Goals:**
- Introduce Lingui with the minimal, idiomatic setup for a Vite + React app.
- Keep the runtime footprint small (compiled catalogs, lazy-loaded per locale) in line with the project's "less is more" mantra.
- Make locale selection user-driven and persisted, defaulting to English.
- Establish a documented, repeatable path for future languages.

**Non-Goals:**
- Backend/API localization (server responses stay as-is).
- Automatic locale detection from `Accept-Language`/browser beyond a simple default; explicit user choice is the source of truth.
- Pluralization/date/number formatting audits beyond what existing strings need.
- Right-to-left layout support.

## Decisions

**Framework: Lingui with macros.** Use `@lingui/core`, `@lingui/react`, `@lingui/macro` (via `@lingui/babel-plugin-lingui-macro`), `@lingui/cli` for extract/compile, and `@lingui/vite-plugin` for compiling `.po` catalogs at build time. Rationale: the user explicitly asked for Lingui; macros (`Trans`, `t`) keep source readable and enable automatic message extraction, avoiding hand-maintained message-ID maps.

**Catalog format & location:** `.po` source catalogs compiled to JS, under `src/locales/{en,it}/messages.po`. `lingui.config.ts` at the frontend root defines `locales: ["en", "it"]`, `sourceLocale: "en"`, and the `po` format. Rationale: `.po` is Lingui's recommended, translator-friendly default; `en` as source means English literals in code are the fallback, satisfying the "missing translation falls back to source" requirement automatically.

**Vite integration:** add `@lingui/vite-plugin` and the babel macro plugin to `@vitejs/plugin-react`'s babel config in `vite.config.ts`. Rationale: standard Lingui+Vite wiring; lets `.po` imports resolve to compiled messages and enables macro transforms in tests too (vitest already uses this config).

**Locale bootstrap & switching:** a small `src/i18n.ts` module exposes `dynamicActivate(locale)` that imports the compiled catalog and calls `i18n.load`/`i18n.activate`. `main.tsx` reads the stored preference (default `en`), activates it before rendering, and wraps `<App/>` in `<I18nProvider i18n={i18n}>`. Rationale: dynamic import keeps only the active locale in the bundle; activating before first render avoids a flash of source text.

**Persistence:** store the chosen locale under a `localStorage` key (e.g. `nello.locale`). Rationale: matches how the frontend already persists client-side preferences, requires no backend change, and satisfies the persistence requirement.

**Language selector placement:** add the selector to the existing `UserMenu`/`UserSettings` area rather than a new global chrome element. Rationale: reuses an existing surface, keeps the change compact; switching calls `dynamicActivate` so text updates without a reload.

**Alternatives considered:** `react-i18next` (heavier config, JSON key maps, not requested); build-time-only static catalogs without dynamic import (simpler but ships all locales and complicates runtime switching). Rejected in favor of Lingui dynamic activation.

## Risks / Trade-offs

- [Large string-extraction surface across ~20 components risks missed literals] → Run `lingui extract` and review the generated catalog for untranslated/empty entries; keep English source as fallback so a miss degrades to English, not breakage.
- [Macro/Vite babel config could interfere with the existing react plugin or vitest] → Validate with `rtk npm run build` and `npm run test` after wiring; keep the plugin order per Lingui docs.
- [Adding several dependencies conflicts with the "compact project" mantra] → Limit to the required `@lingui/*` packages; no extra formatting/detector libraries.
- [Toolchain version drift between `@lingui/*` packages] → Pin all `@lingui/*` to a single matching major version in `package.json`.

## Migration Plan

1. Add dependencies and `lingui.config.ts`; wire Vite plugin and macro.
2. Add `i18n.ts`, provider, and locale bootstrap in `main.tsx`.
3. Replace literals with `Trans`/`t` macros component by component.
4. Run `lingui extract`, add Italian translations, run `lingui compile`.
5. Add the language selector and persistence.
6. Write `doc/multilingual-support.md`.
7. Verify with build + tests.

Rollback: revert the branch; no persisted server state is introduced, and `localStorage` keys are additive and harmless if left behind.

## Open Questions

None blocking. (Whether to later auto-detect browser locale on first visit can be decided independently without changing these specs.)
