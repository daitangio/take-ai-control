## 1. API client types

- [x] 1.1 Update `BoardBrief` to include `isShared: boolean` and `isOwner: boolean` in `api.ts`
- [x] 1.2 Update `CardBrief` and `CardResponse` to include `modifiedBy: string | null` in `api.ts`

## 2. API client — member functions

- [x] 2.1 Add `MemberResponse` interface (`{id: string; email: string}`) to `api.ts`
- [x] 2.2 Add `addMember(boardId: string, email: string)` function to `api.ts`
- [x] 2.3 Add `removeMember(boardId: string, memberId: string)` function to `api.ts`
- [x] 2.4 Add `listMembers(boardId: string)` function to `api.ts`

## 3. State types

- [x] 3.1 Add optional `isShared?: boolean` and `isOwner?: boolean` to `Board` interface in `types.ts`
- [x] 3.2 Add optional `modifiedBy?: string` to `Card` interface in `types.ts`

## 4. Reducer — action types and handling

- [x] 4.1 Extend `board/create` action type to include optional `isShared` and `isOwner` in `types.ts`
- [x] 4.2 Extend `card/create` action type to include optional `modifiedBy` in `types.ts`
- [x] 4.3 Update reducer in `reducer.ts` to store `isShared`/`isOwner` on board create
- [x] 4.4 Update reducer in `reducer.ts` to store `modifiedBy` on card create

## 5. StoreContext — loadBoards

- [x] 5.1 Update `loadBoards` in `StoreContext.tsx` to pass `isShared` and `isOwner` from API response to board/create dispatch
- [x] 5.2 Update `loadBoards` in `StoreContext.tsx` to pass `modifiedBy` from API response to card/create dispatch

## 6. Member management UI

- [x] 6.1 Create `nello/frontend/src/components/MemberDialog.tsx` with member list, add-member form, remove buttons
- [x] 6.2 Add share button (👤) to `BoardSwitcher.tsx` on shared boards owned by current user
- [x] 6.3 Wire MemberDialog into BoardSwitcher (state for `sharingBoardId`, open/close)

## 7. Card tracking UI

- [x] 7.1 Update `CardModal.tsx` to show "Last modified by: `<user_id>`" when `card.modifiedBy` is non-null

## 8. Tests

- [x] 8.1 Update `reducer.test.ts` for new optional fields on actions
- [x] 8.2 Update any component tests affected by new props

## 9. Verification

- [x] 9.1 Run `cd nello/frontend && npm test` — all tests pass
- [x] 9.2 Run `cd nello/frontend && npx tsc --noEmit` — TypeScript clean
- [x] 9.3 Run `cd nello/backend && .venv/bin/pytest` — backend tests still pass
