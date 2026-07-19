# Proposal: add-nello-frontend

## Why

The repo advertises "nello", a Trello-clone demo project driven by OpenSpec, but no application code exists yet. Building the frontend first delivers a usable kanban UI quickly and pins down the behavior a future backend must serve.

## What Changes

- Scaffold a React + TypeScript single-page app (Vite) under `nello/frontend/`
- Board management: create, rename, delete boards; switch between boards
- List management: create, rename, delete, and reorder lists (columns) within a board
- Card management: create, edit (title/description), delete cards; move cards within and across lists via drag & drop
- Client-side persistence: board state survives page reloads via `localStorage` (no backend yet)
- Minimal test setup (Vitest + React Testing Library) covering core state transitions

## Capabilities

### New Capabilities

- `board-management`: creating, renaming, deleting, and switching between kanban boards
- `list-management`: lists (columns) within a board — create, rename, delete, reorder
- `card-management`: cards within lists — create, edit, delete, move within/across lists (incl. drag & drop)
- `board-persistence`: local persistence of all board data across browser sessions

### Modified Capabilities

None — this is the first change; `openspec/specs/` is empty.

## Impact

- New self-contained code under `nello/frontend/`; no changes to the template's tooling (`bin/`, `etc/`, `.devcontainer/`)
- New npm dependencies scoped to `nello/frontend/` only: `react`, `react-dom`, `@dnd-kit/*`, dev deps `vite`, `typescript`, `vitest`, `@testing-library/react`
- Node 24 is already provided by the dev container; no Dockerfile changes required
- No API or backend yet — persistence is browser-local by design and will be replaced by a backend capability in a later change
