## Context

Users need to quickly find cards or lists based on textual content (titles, descriptions, modifiedBy, or list names). Currently, there is no way to filter the board view. We want to add a text field in the upper bar to filter the displayed lists and cards in real time.

## Goals / Non-Goals

**Goals:**
- Provide a text search input in the upper bar.
- Filter lists and cards on the currently active board instantly on client side.
- Search against card `title`, `description`, and `modifiedBy` fields.
- Search against list `name` fields.

**Non-Goals:**
- Server-side search API (not required; data is already in the client state).
- Saving search filters across reloads.
- Advanced search syntax (e.g., regex, boolean operators).

## Decisions

- **State Management**: The `searchQuery` state will be managed inside `StoreProvider` (via `useState`) and exposed through the `StoreCtx` so any component can read/write it. 
  - *Alternative considered*: Storing it in `State` via the reducer. Using `useState` is simpler and separates ephemeral UI state from persisted board/list/card entities.
- **Filtering Logic**: 
  - The filter is case-insensitive.
  - A **Card** is considered a match if its `title`, `description`, or `modifiedBy` includes the search query.
  - A **List** is considered a match if its `name` includes the search query, OR if it contains at least one **Card** that is a match.
  - Lists that do not match are hidden. Cards that do not match are hidden.
- **UI Location**: The search input will be placed in the `app-header` inside `AppInner` in `App.tsx`.
  - *Layout Strategy*: To avoid crowding the space with the horizontally scrolling `.board-tabs`, the search field will be placed on the far right of the header. We will ensure the board tabs maintain `flex: 1` to take up available space, but also configure the search input container to have a fixed or max width, keeping it accessible without interfering with the board tabs. If space is tight, the search input could be represented by an icon that expands on click, but for now, a simple fixed-width input box will be used.

## Risks / Trade-offs

- [Performance] → Large boards with many cards might cause lag on each keystroke. Mitigation: If this becomes a problem, we can debounce the search input update. For now, since boards are reasonably sized client-side, we'll keep it real-time.