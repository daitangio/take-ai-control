## Context

`ListColumn` currently opens its card composer only through the “+ Add Card” button. The composer already intercepts Enter, but `handleAddCard` clears its state and closes it, forcing repeated mouse interaction. The list header is already a distinct interaction for renaming, and cards open their detail view on click; fast entry must not change either behavior.

Card creation is optimistic through `apiDispatch`, so a new title can be submitted without waiting for the backend response. This keeps successive entries responsive and retains the existing error-reconciliation behavior.

## Goals / Non-Goals

**Goals:**

- Start card composition from unused list-body space with focus in the title field.
- Create multiple cards with title, Enter, title, Enter while retaining the composer focus.
- Preserve multiline titles through Shift+Enter, cancellation through Escape, and existing card/list interactions.
- Make empty list bodies easy to click.

**Non-Goals:**

- Global keyboard shortcuts or automatic list selection.
- Bulk import or parsing multiple cards from pasted lines.
- Changes to card API requests, ordering, or optimistic-error handling.

## Decisions

### 1. Trigger composition only from the list-body background

Attach the click trigger to the card-list body and only activate it when the click target is the body itself, not an existing card. The list header remains responsible for renaming and the composer retains its own controls. This gives “click a list” a predictable meaning without stealing established interactions.

Using a click handler on the entire column was rejected because clicks on cards, the header, and controls would need fragile exclusions.

### 2. Preserve composer state after successful Enter submission

Split card creation from composer closing: after a non-empty title is dispatched, clear the title but leave `addingCard` true. The textarea stays mounted, so focus naturally remains ready for the next title. The explicit Add Card button preserves its current one-card-and-close behavior, while Escape still discards the draft and closes.

Making every submission close was rejected because it defeats the primary keyboard flow. Keeping the composer open after clicking the explicit Add Card button was rejected because that control communicates a completed one-off action and preserves current mouse behavior.

### 3. Reserve visible blank body space for empty lists

Give the card-list a practical minimum height when it contains no cards. The existing flex layout continues to grow with content, while an empty list offers enough surface to select it without aiming at a four-pixel drop zone.

Adding a separate “click to add” placeholder was rejected to keep the board visually compact and avoid duplicating the existing Add Card control.

## Risks / Trade-offs

- [A background click can be confused with clicking a card gap] → Only react when the list-body element itself receives the click; card clicks retain their existing behavior.
- [Rapid submissions create concurrent optimistic requests] → Reuse the existing `apiDispatch` flow, which already supports optimistic creates and reconciliation on failure.
- [A larger empty target changes layout slightly] → Keep the minimum height modest and within the existing card-list styling.
