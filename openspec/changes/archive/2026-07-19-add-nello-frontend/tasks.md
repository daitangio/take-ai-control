# Tasks: add-nello-frontend

## 1. Scaffold

- [x] 1.1 Scaffold Vite `react-ts` app in `nello/frontend/` (npm create vite), TypeScript `strict`, verify `npm run dev` and `npm run build` pass
- [x] 1.2 Add deps `@dnd-kit/core` + `@dnd-kit/sortable`; dev deps `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`; wire `npm test` to vitest
- [x] 1.3 Strip Vite demo boilerplate; add app shell (header + board area) and base CSS modules

## 2. State core

- [x] 2.1 Define types and normalized `State` shape (`boards`/`lists`/`cards` records + id-order arrays + `activeBoardId`) in `src/state/types.ts`
- [x] 2.2 Implement reducer with board actions: create (becomes active), rename, delete (cascade lists+cards, re-activate another board), switch; reject empty/whitespace names
- [x] 2.3 Implement reducer list actions: create (append), rename, delete (cascade cards), reorder
- [x] 2.4 Implement reducer card actions: create (append, non-empty title), edit title/description, delete, move (within list / across lists / to empty list, at position)
- [x] 2.5 Unit-test every reducer action incl. edge cases (empty names, cascades, active-board fallback, move positions)
- [x] 2.6 Provide store via Context + `useReducer` (`StoreProvider`, `useStore` hook)

## 3. Persistence

- [x] 3.1 Define `Storage` interface; implement localStorage adapter with versioned payload `{ version: 1, state }` under key `nello:v1`
- [x] 3.2 Load-on-boot with schema validation; fall back to empty initial state on missing/corrupt data
- [x] 3.3 Debounced (~200ms) write-through subscribed to reducer commits
- [x] 3.4 Unit-test adapter: round-trip, first visit, corrupt JSON, wrong version

## 4. Board UI

- [x] 4.1 Board switcher in header: list boards, switch active, create board (inline form with empty-name rejection)
- [x] 4.2 Board rename (inline edit) and delete with confirm dialog
- [x] 4.3 Empty state when no boards exist, with create call-to-action

## 5. Lists & cards UI

- [x] 5.1 Render active board's lists as columns; "add list" affordance at the end
- [x] 5.2 List header: inline rename, delete with confirm (warns about contained cards)
- [x] 5.3 Card tiles in lists; "add card" composer per list (empty-title rejection)
- [x] 5.4 Card detail modal: edit title (non-empty) and description, delete with confirm

## 6. Drag & drop

- [x] 6.1 Wire dnd-kit context in one module (`src/dnd/`); pointer + keyboard sensors
- [x] 6.2 Card DnD: reorder within list, move across lists at position, drop into empty list — dispatching the single `card/move` action
- [x] 6.3 List DnD: reorder columns within the board
- [x] 6.4 Drag overlay/visual affordances (dragging state, drop placeholder)

## 7. Verification

- [x] 7.1 Component smoke tests: create board→list→card flow, persistence reload restores state (per spec scenarios)
- [x] 7.2 Full pass: `npm test`, `npm run build`, `tsc --noEmit` clean; manual walkthrough of all spec scenarios in the browser
- [x] 7.3 Update repo docs: note `nello/frontend/` dev commands in README nello section; update LOG.md
