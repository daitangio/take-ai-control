## 1. State Management

- [x] 1.1 Add `searchQuery` string state to `StoreProvider` in `nello/frontend/src/state/StoreContext.tsx`
- [x] 1.2 Expose `searchQuery` and `setSearchQuery` in the `StoreValue` interface and context provider

## 2. UI Component

- [x] 2.1 Add a text input field in the `app-header` inside `AppInner` (`nello/frontend/src/App.tsx`), positioned to the right of the board tabs.
- [x] 2.2 Wire the text input to read from `searchQuery` and call `setSearchQuery` on change
- [x] 2.3 Add CSS in `App.css` to align the search input properly on the right (e.g. `margin-left: auto` or using the existing flex layout) and ensure it doesn't break the `board-tabs` scrolling.

## 3. Filtering Logic

- [x] 3.1 Update `nello/frontend/src/components/BoardView.tsx` to read `searchQuery` from `useStore()`
- [x] 3.2 Implement filtering logic for `cards`: a card matches if its title, description, or modifiedBy contains the search query (case-insensitive)
- [x] 3.3 Implement filtering logic for `lists`: a list matches if its name contains the search query OR any of its cards match
- [x] 3.4 Ensure non-matching lists are not rendered
- [x] 3.5 Pass the filtered cards (or the search query) to `ListColumn` so it only renders matching cards