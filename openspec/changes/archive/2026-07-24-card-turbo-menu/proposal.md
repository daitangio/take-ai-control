## Why

Cards need faster in-place actions without forcing every operation through the full detail modal. The existing card model supports title/description editing, deletion, and movement, but it does not yet support card due dates, non-destructive card archiving, or assigning multiple board members to a specific card.

## What Changes

- Add a compact right-side action button on each card tile that opens a card action popup.
- Add popup actions to open card details, manage assigned members, edit a due date, and archive the card.
- Add per-card multi-member assignment separate from board membership. Board members remain the access-control/eligibility source; card assignments are stored independently.
- Add card due date storage, API transport, frontend state, card modal editing, and card tile display.
- Add non-destructive card archive behavior that hides archived cards from normal board views while preserving card data and assignments.
- Preserve existing card body/title click behavior for opening details and existing drag-and-drop behavior for cards.

## Capabilities

### New Capabilities

- `card-assignment`: Assign zero or more eligible board users to a card and manage those assignments from a card-scoped popup.

### Modified Capabilities

- `card-management`: Add card action popup behavior, due-date editing/display, and non-destructive card archive behavior.
- `backend-api`: Add card archive, due-date, and assignment API support to authenticated card and board-detail endpoints.
- `data-persistence`: Add persistent due-date, card archive, and many-to-many card assignment storage.

## Impact

- Frontend components: `CardTile`, `CardModal`, `BoardView`, `ListColumn`, and a new card-member popup/dialog component.
- Frontend state/API: card types, reducer actions, API client functions, optimistic update/reload behavior, and tests.
- Backend API: card models, router endpoints, card service functions, board-detail responses, and tests.
- Database: card due-date migration, card archive marker table, and card assignment join table.
