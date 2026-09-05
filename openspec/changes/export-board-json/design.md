## Context

Nello auth is JWT Bearer header only (`fetchWithAuth` sets `Authorization`; no cookies). The frontend keeps all API access inside `StoreContext.tsx` — components never import `api` directly. `GET /api/boards/:id` already returns the full board (`BoardDetail`: board + lists + cards with members). See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Download the active board's JSON through the existing boards API, no backend change.
- Sanitized file name: whitespace runs → `-`, all other non-alphanumeric characters removed, `board.json` fallback.
- Follow existing patterns: StoreContext owns API calls, errors go through the existing toast.

**Non-Goals:**
- No import/restore of exported files.
- No export of archived cards (excluded by the boards API, same as the board view).
- No new reducer action — export changes no application state.

## Decisions

**D1 — Client-side download, no backend endpoint.**
A backend export route with `Content-Disposition` would still require the client to `fetch` (header-only auth means a plain `<a href>` navigation 401s) and then download a blob anyway — the endpoint adds nothing. Rejected in favor of: `getBoard(boardId)` → `JSON.stringify` → `Blob` → `URL.createObjectURL` → anchor click → `revokeObjectURL`.

**D2 — `exportBoard(boardId)` helper in StoreContext.**
Mirrors `reloadBoard`: calls `api.getBoard`, on failure sets the toast via `toLocalizedErrorMessage` and returns `null`; on success returns the raw `BoardDetail`. Alternative (UserMenu importing `api` directly) rejected: it breaks the established single-owner rule for API access.

**D3 — Sanitization lives in UserMenu as a small pure function.**
`name.replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '')`, then `|| 'board.json'` when the result has no alphanumeric character, plus `.json` suffix. UserMenu is its only consumer; a pure function keeps it unit-testable without a new util file.

**D4 — No reducer action; local `isExporting` state in UserMenu.**
The reducer models board/list/card state only. Export is transient UI state (disables the entry while pending, re-enables on settle) — component state suffices.

**D5 — i18n key `userMenu.exportBoard` in all 5 locales.**
The menu renders `t('userMenu.exportBoard')`; en/it/fr/de/es resource blocks each get the key. Missing keys would render raw on locale switch.

**D6 — Tests stub the missing jsdom APIs.**
`URL.createObjectURL`/`revokeObjectURL` don't exist in jsdom; the test stubs them (`vi.stubGlobal`) and asserts the anchor's `download`/`href` instead of real download behavior.

## Risks / Trade-offs

- [jsdom lacks `createObjectURL`] → stubbed in tests; the download path itself is thin and exercised manually.
- [Degenerate board names ("!!!", "- -")] → `board.json` fallback per spec.
- [Export reflects server state at click time] → intentional: a fresh `getBoard` is authoritative and matches the board view.

## Migration Plan

None — frontend-only feature, no API, schema, or dependency changes. Rollback is a revert of the frontend change.
