## Context

See [proposal.md](proposal.md) for motivation and [the card-management delta](specs/card-management/spec.md) for required behavior. The database migration already adds a nullable `card.link` column, but the backend schema, card API, frontend state, and card UI omit it.

## Goals / Non-Goals

**Goals:**

- Carry a nullable card link consistently through storage, API responses, frontend state, and edits.
- Provide a safe, keyboard-accessible tile control that does not conflict with the tile's modal-opening or drag behavior.

**Non-Goals:**

- Rich link previews, custom link labels, URL metadata fetching, or non-HTTP(S) protocols.
- Changing the initial card-creation flow; links are managed from card details.

## Decisions

### Treat link as nullable end-to-end

Add `link: string | null` to card persistence and response/state types. The PATCH body distinguishes an omitted link (preserve it) from an explicit `null` (clear it), matching the existing due-date and color update semantics.

This avoids accidentally clearing a link when the tile's due-date or color controls submit a card edit. Treating an empty string as a stored value was rejected because it complicates absence checks and icon rendering.

### Validate links at the API boundary

The backend accepts only absolute `http:` and `https:` URLs, or `null`. The editor uses a URL input for early feedback, but the API remains authoritative because clients can bypass browser validation.

Allowing arbitrary text or schemes was rejected: an anchor using an unsafe scheme could execute script-like browser behavior.

### Auto-fill a blank link from the edited description

When the description changes in the card detail view, the frontend finds the first HTTPS URL. If the local link input is blank, it assigns that URL to the input and displays a translated, ephemeral confirmation message. Saving the card persists both changes through the ordinary card-edit request.

Extraction is intentionally frontend-only: it improves editing convenience without changing how the backend interprets descriptions. Replacing an existing link, extracting non-HTTPS URLs, or showing a message when no value changes were rejected to avoid surprising edits and notification noise.

### Use a sibling external-link control rather than nesting an anchor in the title button

The existing title sits inside the tile's main button. The external-link control will be a sibling interactive element, visually adjacent to the title, because nesting an anchor or button inside a button is invalid HTML. Its pointer/click handling prevents the parent tile listener from opening the details modal or starting a drag.

The control uses an anchor with `target="_blank"` and `rel="noopener noreferrer"`, plus a translated accessible name. Opening in the same browsing context was rejected because it would take users away from the board.

## Risks / Trade-offs

- [A card update from a tile action could erase its link] → Include the current link in edit actions from due-date and color controls, and only alter the database column when the field is present.
- [Unexpected legacy link values could be unsafe to render] → Validate server updates and conditionally render only HTTP(S) values; existing invalid stored data remains non-clickable until corrected.
- [Extra tile control could interfere with dragging] → Stop propagation for link control pointer and click events; cover this with an interaction test.
- [Auto-fill could replace an intentional link] → Run extraction only while the link input is blank and test the non-overwrite case.

## Migration Plan

1. Deploy the application change using the existing nullable `card.link` column from `db-init/003-link.sql`.
2. Verify an existing card without a link still loads and renders normally.
3. Roll back application code if needed; nullable values remain stored without affecting cards that do not use links.
