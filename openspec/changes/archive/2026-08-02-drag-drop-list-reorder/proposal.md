## Why

List reordering already works, but the entire list header is the drag source — there is no visible affordance telling the user that a list is grabbable, and the gesture overlaps with clicking the title (rename) and the `...` action menu. Users discover reordering by accident and risk starting a drag when they only meant to interact with the header controls. A dedicated **drag handle** makes "grab to reorder" obvious and isolates the drag gesture from the other header interactions.

## What Changes

- Add a graphic drag handle (grip affordance) to each list header, rendered as the sole trigger for starting a list drag.
- Remove the list drag `listeners` from the whole `.list-header`; attach them only to the handle so that clicking the title or the `...` menu never starts a drag.
- The handle exposes accessible drag affordance (label/`aria-label`) and the existing keyboard support provided by `@dnd-kit`.
- The handle is only shown for visible, non-archived lists (archived lists are not reorder targets and never render a handle).
- No backend or persistence change — reorders still dispatch the existing `list/reorder` action.

## Capabilities

### New Capabilities

<!-- None: list reordering already exists; this only refines its interaction. -->
_(none)_

### Modified Capabilities

- `list-management`: The list reordering interaction is refined — reordering SHALL be initiated from a dedicated graphic drag handle on the list header (not from the whole header), and interacting with the title or action menu MUST NOT start a drag.

## Impact

- `nello/frontend/src/components/ListColumn.tsx`: move the sortable `listeners` from the `.list-header` container onto a new handle element; gate the handle on non-archived/visible state.
- `nello/frontend/src/components/ListColumn.css`: add styles for the `.list-drag-handle` affordance (rest/hover/dragging states) and adjust header layout to accommodate it.
- `nello/frontend/src/components/ListColumn.test.tsx`: add tests asserting the handle is the drag trigger and other header controls do not start a drag.
- No new dependencies; reuses `@dnd-kit/sortable` `useSortable` listeners/attributes, which are already imported.
