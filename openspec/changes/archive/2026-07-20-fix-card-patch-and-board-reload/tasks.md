## 1. Fix spurious PATCH on card close

- [x] 1.1 In `CardModal.tsx`, add a dirty check to the `save` function: only call `apiDispatch({ type: 'card/edit' })` when `title !== card.title || description !== card.description`
- [x] 1.2 Add a test verifying that opening and closing a card without edits does NOT call `apiDispatch`

## 2. Reload board on switch

- [x] 2.1 In `BoardSwitcher.tsx`, change the board tab click handler: if the clicked board is not already active, call `loadBoards(boardId)` instead of `dispatch({ type: 'board/switch', boardId })`
- [x] 2.2 Add a test verifying that switching boards calls `loadBoards` with the target board ID
