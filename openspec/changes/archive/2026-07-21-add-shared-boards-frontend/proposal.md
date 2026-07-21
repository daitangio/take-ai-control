## Why

The backend now supports shared boards (via `$` suffix), member management, and card `modifiedBy` tracking. The frontend has no UI for any of this — you can't add members, see who modified a card, or even tell a board is shared. This change wires the frontend to the new backend capabilities.

## What Changes

- `api.ts`: update response types to include `isShared`, `isOwner`, `modifiedBy`; add `addMember`, `removeMember`, `listMembers` functions
- `types.ts`: add optional `isShared`/`isOwner` to `Board`, `modifiedBy` to `Card`
- `StoreContext.tsx`: update `loadBoards` to pass through new fields from API responses
- `BoardSwitcher.tsx`: add share button (👤) on shared boards owned by current user, clicking opens member dialog
- New `MemberDialog.tsx`: modal showing member list, email input to add, remove button per member (owner only)
- `CardModal.tsx`: show "Modified by" field when `modifiedBy` is present

## Capabilities

### New Capabilities

- `member-management`: UI for adding/removing members on shared boards, accessible via a share button in the board switcher
- `board-sharing-ui`: Visual indicators for shared boards (share icon)
- `card-tracking-ui`: Display of who last modified a card in the card modal

### Modified Capabilities

- `board-management`: Board switcher gains share button and member dialog
- `board-persistence`: API client types updated to carry new response fields

## Impact

- Frontend only — no backend changes
- New component: `MemberDialog.tsx`
- Modified: `api.ts`, `types.ts`, `StoreContext.tsx`, `BoardSwitcher.tsx`, `CardModal.tsx`
- Existing 43 frontend tests should continue passing with minor updates
