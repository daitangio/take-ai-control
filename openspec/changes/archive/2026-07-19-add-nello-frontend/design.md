# Design: add-nello-frontend

## Context

"nello" is the demo project of this template repo (see README): a Trello-clone built spec-first with OpenSpec. Nothing exists yet — `openspec/specs/` is empty and there is no application code. This change builds the frontend only; a backend will come in a later change. The repo mantra is *less is more*: minimal dependencies, compact setup, runs inside the provided Node 24 dev container.

## Goals / Non-Goals

**Goals:**

- A working kanban SPA: boards → lists → cards, with drag & drop
- React + TypeScript (strict), scaffolded with Vite under `nello/frontend/`
- State survives page reloads (localStorage)
- Core state logic covered by unit tests; app boots and builds cleanly

**Non-Goals:**

- Backend, API, authentication, or multi-user collaboration
- Real-time sync, offline sync, multi-tab conflict resolution
- Card extras (labels, due dates, attachments, comments, checklists)
- Mobile-first polish; desktop browser is the target

## Decisions

### 1. Location: `nello/frontend/`

Self-contained subdirectory; leaves room for `nello/backend/` in a later change without restructuring. Alternatives: repo root (pollutes the template) or a full monorepo workspace setup (overkill for one app).

### 2. Tooling: Vite `react-ts` template

Fast, minimal, standard. Alternatives considered: Next.js (SSR/routing machinery we don't need), CRA (deprecated).

### 3. State: `useReducer` + React Context, normalized store

Single store, normalized shape so moves/reorders are cheap id-array splices and a future API mapping is direct:

```ts
type State = {
  boards: Record<BoardId, { id; name; listIds: ListId[] }>;
  lists:  Record<ListId,  { id; name; cardIds: CardId[] }>;
  cards:  Record<CardId,  { id; title; description }>;
  activeBoardId: BoardId | null;
};
```

All mutations are reducer actions (`board/create`, `card/move`, ...) — pure, unit-testable, and the single choke point for persistence. Alternatives: Redux Toolkit or Zustand (extra dependency for no gain at this size).

### 4. Drag & drop: `@dnd-kit/core` + `@dnd-kit/sortable`

Maintained, small, keyboard-accessible sensors out of the box. Alternatives: native HTML5 DnD (poor keyboard/touch support, browser quirks), `react-beautiful-dnd` (archived/unmaintained).

### 5. Persistence: localStorage behind a storage interface

Write-through after every reducer commit (debounced ~200ms), loaded on boot. Stored as `{ version: 1, state }` under key `nello:v1`; invalid/missing payloads fall back to an empty initial state. The store talks to a tiny `Storage` interface so a later change can swap localStorage for an API client without touching components. Alternative: IndexedDB (async complexity, unneeded at this data size).

### 6. Styling: plain CSS modules

Vite supports them natively; zero extra dependencies. Alternative: Tailwind (adds toolchain weight against the *less is more* mantra).

### 7. Testing: Vitest + React Testing Library (jsdom)

Vitest shares the Vite pipeline. Focus: exhaustive reducer tests (every action, incl. move edge cases) plus a few smoke-level component tests. IDs via `crypto.randomUUID()` (available in Node 24 and all target browsers).

## Risks / Trade-offs

- [localStorage is single-device, ~5MB, last-write-wins across tabs] → Accepted for MVP; schema is versioned so a backend swap or migration is a contained change.
- [DnD is the fiddliest part (collision detection, cross-list drops)] → Confine all dnd-kit wiring to one module; reducer exposes a single `card/move` action that DnD merely dispatches; covered by reducer tests.
- [No backend means specs may later shift (e.g. optimistic updates)] → Persistence interface isolates that; specs written against user-visible behavior, not storage.
- [Deleting a list/board cascades to contained cards] → Destructive actions require an explicit confirm in the UI; cascade logic unit-tested.

## Migration Plan

Greenfield: nothing to migrate. Rollback = delete `nello/frontend/`. No changes to template tooling or Dockerfile (Node 24 already present).

## Open Questions

- None blocking. Backend stack and API shape are deliberately deferred to a future change.
