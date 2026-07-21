## Why

Currently, each board is owned by a single user. There is no way to collaborate on a board with other users. Adding board sharing enables multi-user collaboration — the key feature that turns nello from a personal kanban into a collaborative tool. Additionally, with multiple users modifying cards on a shared board, each card must track who last modified it.

## What Changes

- New `board_member` junction table for tracking which users have access to a shared board
- New `modified_by` column on the `card` table to track the last user who modified each card
- Board sharing is signaled by a `$` suffix in the board name (e.g., "Team Board$"). The `$` is permanent — once a board is shared, it cannot be unshared
- New member management endpoints: add member (owner only), remove member (owner only), list members
- Authorization refactoring: all board/list/card operations accept both the board owner and shared members, except delete board (owner only) and member management (owner only)
- API responses: `BoardResponse` gains `isShared` and `isOwner` fields; `CardResponse` and `CardBrief` gain `modifiedBy`
- Shared boards appear in the owner's and members' board listings

## Capabilities

### New Capabilities

- `board-sharing`: Multi-user access to boards via a `board_member` table and `$` name convention. The board creator is the owner and can invite other users by email. Members can read the board and CRUD lists and cards, but cannot delete the board or manage members.
- `card-tracking`: Every card records the ID of the last user who created or modified it via a `modified_by` column, returned in API responses as `modifiedBy`.

### Modified Capabilities

- `backend-api`: Board listing returns shared boards alongside owned boards. Board/lists/card endpoints accept member access in addition to owner access. Board rename is rejected if it would drop the `$` suffix from a shared board. New member management endpoints are added.
- `board-management`: Board response includes `isShared` and `isOwner` fields for the frontend to adapt its UI.

## Impact

- Backend: schema migration (1 new table, 1 new column), new shared helper `check_board_access()`, new member router, modified authorization checks across all service functions
- Backend tests: new test file for member management and shared board scenarios, updates to existing tests for new response fields
- No frontend changes in this phase (backend-only)
- No changes to template tooling, Dockerfile, or other projects
