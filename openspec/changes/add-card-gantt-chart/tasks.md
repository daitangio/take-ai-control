## 1. Persistence and backend contract

- [ ] 1.1 Add and run an ordered SQLite migration that creates `card.effort_days REAL NOT NULL DEFAULT 1`, then verify existing card rows load with effort `1`
- [ ] 1.2 Synchronize the Drizzle card schema with the migrated database and verify TypeScript recognizes `effortDays` as a numeric column
- [ ] 1.3 Extend card create/update request handling to preserve omitted effort, accept positive finite numeric effort, and reject null, non-numeric, non-finite, zero, and negative values; verify route tests cover every case
- [ ] 1.4 Include effort in card, board-detail, archived-card, and export response mappings; verify API tests assert `effortDays` in create, update, board retrieval, archive/unarchive, and export paths
- [ ] 1.5 Run the backend card and board test suites with `rtk npm test -- --run tests/cards.test.ts tests/boards.test.ts` from `nello/backend` and verify they pass

## 2. Frontend card data and editing

- [ ] 2.1 Extend frontend card/API/state action types and API update serialization for numeric `effortDays`, preserving omission behavior for untouched optional fields; verify API and reducer unit tests cover load and update propagation
- [ ] 2.2 Add a localized fractional numeric effort-days input to the card detail modal, including dirty checking and client-side invalid-value feedback; verify CardModal tests cover initial default, integer/fractional saves, unchanged close, and invalid input
- [ ] 2.3 Ensure API responses reconcile optimistic effort updates and existing board-event reloads hydrate effort values; verify the frontend state reflects the server-returned value after edits

## 3. Gantt view and board-menu access

- [ ] 3.1 Add localized active-board Gantt chart command wiring in `UserMenu` and app-level open/close state; verify UserMenu tests cover visibility, invocation, menu closing, and no-active-board behavior
- [ ] 3.2 Implement timezone-safe date-only helpers and scheduled-card projection that filters undated cards, preserves board/list/card order, derives inclusive ranges, and supports fractional effort; verify focused unit tests cover one-day, multi-day, fractional, and DST-safe date cases
- [ ] 3.3 Implement the accessible, closable Gantt dialog with list groups, a horizontal date timeline, sticky labels, proportional bars, and a no-dated-cards empty state; verify component tests cover rendered groups, bar labels/ranges, close behavior, and the empty state
- [ ] 3.4 Add responsive Gantt styling without a new charting dependency and verify the chart remains horizontally usable at narrow viewport widths

## 4. Integration verification

- [ ] 4.1 Run frontend tests with `rtk npm test -- --run` from `nello/frontend` and verify all tests pass
- [ ] 4.2 Run the required frontend production build with `rtk npm run build` from `nello/frontend` and verify it completes successfully
- [ ] 4.3 Perform a human test: create/edit cards with efforts `1`, `1.5`, and `3` plus an undated card; set due dates; open the active board's Gantt chart; verify bars end on due dates, have correct relative durations and list grouping, the undated card is absent, the chart closes cleanly, and a board with no dated cards shows its empty state
