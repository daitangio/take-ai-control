## Why

Shared-board users cannot tell from a card tile when somebody else last edited it. A compact indicator with the editor's email makes collaboration visible without opening the card modal.

## What Changes

- Return card editor email and a requester-relative "edited by current user" flag in card responses.
- Store this metadata in frontend card state.
- Show a non-interactive editor icon to the right of a card title only when another user last edited the card.
- Expose the editor email through the icon tooltip and accessible label.

## Capabilities

### New Capabilities

- `card-editor-indicator`: Card-tile indicator and tooltip for cards last edited by another user.

### Modified Capabilities

- `backend-api`: Card response payloads include editor display metadata for authenticated requesters.

## Impact

- Backend card and board-detail queries join editor email from users.
- Frontend API/state types, reducer metadata propagation, and card-tile presentation change.
- Backend and frontend tests gain metadata and visibility coverage.
