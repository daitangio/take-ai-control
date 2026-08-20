## 1. Data model and capacity service

- [x] 1.1 Map `user_tier` and `user.tier_id` in the runtime and generated Drizzle schemas, including default-tier behavior in test setup.
- [x] 1.2 Implement a shared, transaction-compatible capacity helper that resolves board-owner tier limits and active board/list/card counts.
- [x] 1.3 Add backend unit tests for tier resolution, ownership scope, and archived list/card exclusion from active capacity.

## 2. Backend enforcement and API contract

- [x] 2.1 Enforce the board limit transactionally in board creation and return `BOARD_LIMIT_REACHED` with HTTP 409 when full.
- [x] 2.2 Enforce the active-list limit transactionally in list creation and return `LIST_LIMIT_REACHED` with HTTP 409 when full.
- [x] 2.3 Enforce the active-card limit transactionally in card creation, cross-list moves, and unarchive, preserving the card's prior state on rejection and returning `CARD_LIMIT_REACHED` with HTTP 409.
- [x] 2.4 Extend board, list, card, move, and unarchive responses with post-operation capacity usage/limit metadata; include current capacity in board summary and detail reads.
- [x] 2.5 Add backend route tests for free-tier boundaries, 409 error codes, archive capacity release, owner-tier behavior on shared boards, move/unarchive atomicity, and capacity response metadata.
- [x] 2.6 Run `rtk npm test` and `rtk npm run build` in `nello/backend`.

## 3. Frontend capacity feedback

- [x] 3.1 Update API types and client handling for capacity metadata and new capacity-limit error codes.
- [x] 3.2 Create a reusable non-blocking capacity warning that renders localized resource labels and `used/limit` at or above the 75% threshold.
- [x] 3.3 Show board, list, and card capacity warnings in the board switcher and relevant board/list creation surfaces; keep creation enabled below the server-enforced limit.
- [x] 3.4 Add localized warning and error strings for English, Italian, French, German, and Spanish.
- [x] 3.5 Add frontend unit tests for the 75% threshold, below-threshold absence, usage rendering, and localized capacity errors.
- [x] 3.6 Run `rtk npm test` and `rtk npm run build` in `nello/frontend`.

## 4. Release verification

- [x] 4.1 Apply the migration process to a copy of an existing database and verify all existing users resolve to a valid tier.
- [x] 4.2 Human-test the free-tier boundaries: create three boards, twelve active lists, and forty-eight active cards; verify 75% warnings, capacity release on archive, localized errors at the limit, and shared-board owner-tier behavior.
