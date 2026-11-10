## Why

Cards can already store a link in the database, but users cannot manage or follow it in Nello. Completing the link flow makes related work and resources reachable directly from a card.

## What Changes

- Add an optional link field to card editing; an empty field clears the stored value.
- When a description contains an HTTPS URL and the link field is blank, automatically use that URL and notify the editor.
- Persist and return the link through the card API and board-detail responses.
- Show a clickable, accessible external-link icon beside a card title when that card has a link.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `card-management`: Cards gain an optional persisted link that users can edit and open from their tiles.

## Impact

- Backend card schema, PATCH endpoint, card and board-detail response shapes, and related tests.
- Frontend card state, API client, editor, card-tile UI, translations, and tests.
- Existing `card.link` database column from `db-init/003-link.sql` is used; no new migration is required.
