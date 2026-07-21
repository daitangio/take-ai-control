## 1. Backend Persistence

- [x] 1.1 Add SQLite startup migrations for nullable `card.due_date`, `card_archive`, and `card_member`.
- [x] 1.2 Add backend tests proving existing cards load with `dueDate: null` and `members: []`.
- [x] 1.3 Add backend tests proving archived cards remain stored but are hidden from board-detail responses.
- [x] 1.4 Add backend tests proving multiple card members can be stored and duplicate assignments are prevented.

## 2. Backend API

- [x] 2.1 Extend card Pydantic models and board-detail card payloads with `dueDate` and `members`.
- [x] 2.2 Extend card update service/API handling so due dates can be set, changed, or cleared while preserving title/description behavior.
- [x] 2.3 Add `POST /api/cards/{card_id}/archive` and service logic using `card_archive`.
- [x] 2.4 Add card member list/add/remove endpoints and service logic backed by `card_member`.
- [x] 2.5 Validate card member assignments against parent board access without modifying the `board_member` schema.
- [x] 2.6 Remove a user's card assignments for a board when that user is removed from the board members list.

## 3. Frontend State And API

- [x] 3.1 Extend frontend API types and client functions for card due dates, card archive, and card member operations.
- [x] 3.2 Extend `Card` state type with `dueDate` and `members`.
- [x] 3.3 Add reducer actions for due-date updates, card archive hiding, and card member add/remove state updates.
- [x] 3.4 Wire `StoreContext` API dispatch/reload behavior for the new card actions.
- [x] 3.5 Add frontend state/API regression tests for metadata loading and optimistic action behavior.

## 4. Card Turbo Menu UI

- [x] 4.1 Add a right-side card action button to `CardTile` that does not trigger card body click or drag.
- [x] 4.2 Add the card action popup with Details, Members, Due date, and Archive actions.
- [x] 4.3 Reuse the existing card detail modal for the Details action.
- [x] 4.4 Add a card-scoped member popup that can add/remove multiple eligible board users.
- [x] 4.5 Add due-date editing from the card action popup and card detail modal.
- [x] 4.6 Add visible card due-date and assigned-member summaries without overcrowding card tiles.
- [x] 4.7 Add card archive UI behavior that hides the card and closes any card-specific popup/modal.

## 5. Verification

- [x] 5.1 Add component tests for card body click, action-button click, popup close, and action selection behavior.
- [x] 5.2 Add component tests for member assignment and due-date editing flows.
- [x] 5.3 Run backend tests.
- [x] 5.4 Run frontend tests.
- [x] 5.5 Run OpenSpec validation for `card-turbo-menu`.
- [x] 5.6 Run `rtk npm run build` in `nello/Frontend` as the final frontend verification step.
