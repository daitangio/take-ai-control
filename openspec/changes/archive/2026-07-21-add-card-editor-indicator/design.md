## Context

Cards currently retain only the last editor's user ID. The API already authenticates each request and can identify both the editor and requester, but neither the editor email nor requester-relative state reaches the card tile.

## Goals / Non-Goals

**Goals:**

- Show a compact editor icon beside cards changed by another user.
- Reveal that editor's email in an accessible tooltip.
- Avoid client-side identity comparisons that fail after a page reload.

**Non-Goals:**

- A complete edit history, avatars, or user profiles.
- Showing an indicator on cards last edited by the current user.

## Decisions

### Requester-relative response metadata

Card responses will expose `modifiedByEmail` and `isModifiedByCurrentUser`. Backend queries join the editor user record; the authenticated requester is compared server-side. This avoids a new current-user endpoint and makes board-detail and mutation responses consistent.

### Non-interactive icon

The tile renders a small person icon after the title only when the card has an editor email and was not last edited by the current user. A native `title` plus accessible label exposes the email without interfering with tile click or keyboard drag behavior.

## Risks / Trade-offs

- [User lookup adds a join to card reads] → Reuse the existing user table join in board-detail and card response queries.
- [Editor may be missing on legacy cards] → Omit the indicator when editor metadata is null.
