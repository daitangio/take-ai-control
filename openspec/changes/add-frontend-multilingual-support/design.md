## Context

Nello frontend components currently embed English strings directly in TSX files, and tests assert those literals in many places. See `proposal.md` for motivation and scope. The change must introduce library-based i18n while preserving existing behavior, including responsive layout constraints and current authentication/state flows.

## Goals / Non-Goals

**Goals:**
- Introduce a single frontend i18n integration point with locale provider, translation resources, and key-based lookup.
- Add a complete Italian translation set for current frontend-owned UI strings.
- Persist selected locale and restore it on reload.
- Localize backend-originated error feedback by mapping stable backend `error_code` values to locale keys.
- Keep default English behavior for users who do not change locale.
- Document the language onboarding process in `nello/frontend/doc/multilingual-support.md`.

**Non-Goals:**
- Translating arbitrary backend free-text error messages without an `error_code`.
- Redesigning UX copy beyond translation equivalence.
- Adding right-to-left support in this iteration.

## Decisions

### Decision 1: Use a standard React i18n library
- **Choice:** Add a widely used i18n library for React and initialize it in frontend bootstrap.
- **Rationale:** This avoids maintaining custom interpolation/pluralization logic and reduces long-term localization maintenance cost.
- **Alternatives considered:**
  - Custom lightweight translator module: lower dependency overhead but weak long-term ergonomics and feature depth.
  - Build-time static replacement: difficult to support runtime language switching and persistence.

### Decision 2: Centralize translations in locale resource files
- **Choice:** Move user-facing strings to locale dictionaries (default `en`, new `it`) grouped by feature area.
- **Rationale:** Centralized keys make coverage review and future language addition predictable.
- **Alternatives considered:**
  - Component-local dictionaries: fragments translation ownership and increases key duplication risk.

### Decision 3: Add runtime locale provider with persistence
- **Choice:** Expose locale and setter via a provider/hook; persist selection in local storage.
- **Rationale:** Enables cross-component language updates and user preference continuity.
- **Alternatives considered:**
  - URL-only locale state: less suitable for current SPA patterns and persistence expectations.
  - Non-persisted in-memory locale: degrades UX across refreshes.

### Decision 4: Migrate tests with stable locale assumptions
- **Choice:** Update tests to run with deterministic locale setup (default English unless explicitly testing Italian).
- **Rationale:** Prevents test flakiness caused by environment locale differences.
- **Alternatives considered:**
  - Snapshot-heavy locale testing: higher maintenance with low signal.

### Decision 5: Standardize backend error payloads for localization
- **Choice:** Return stable, documented `error_code` values from backend error responses used by frontend flows, and map those codes to locale messages in the frontend.
- **Rationale:** Error-code contracts decouple localization from backend wording and keep translated UX consistent.
- **Alternatives considered:**
  - Localize raw backend `detail` text directly: brittle and tightly couples frontend UX to backend phrasing.
  - Hardcode per-endpoint frontend heuristics from status codes only: too ambiguous for user-friendly messaging.

## Risks / Trade-offs

- **[Risk] Large string migration across many components can miss edge labels** → **Mitigation:** create a migration checklist and include test coverage updates for touched screens.
- **[Risk] Added dependency may increase bundle size** → **Mitigation:** keep initialization lean and avoid unused plugin features.
- **[Risk] Long Italian labels can affect compact layouts** → **Mitigation:** verify responsive behavior at narrow breakpoints and adjust CSS where needed.
- **[Risk] Incomplete translation keys at runtime** → **Mitigation:** enforce fallback to English and include key-coverage review before merge.
- **[Risk] Backend and frontend drift on error-code taxonomy** → **Mitigation:** define and document canonical error codes and add tests asserting code presence for key error paths.

## Migration Plan

1. Define backend error-code contract for targeted frontend flows and return stable `error_code` fields in error payloads.
2. Add i18n dependency and initialize translation provider at app bootstrap.
3. Introduce locale dictionaries (`en`, `it`) and translation key conventions, including backend error-code message entries.
4. Refactor UI components from inline literals to translation keys and route backend errors through error-code translation mapping.
5. Add locale selector and local-storage persistence.
6. Update tests to deterministic locale handling and add targeted assertions for Italian coverage paths and error-code localization.
7. Add `nello/frontend/doc/multilingual-support.md` with onboarding instructions for additional languages.

Rollback strategy: revert provider integration and dictionary usage in one commit to restore current hardcoded-English behavior if issues are discovered.
