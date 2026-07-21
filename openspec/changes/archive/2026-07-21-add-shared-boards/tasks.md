## 1. Schema migration

- [x] 1.1 Add `board_member` table DDL to `SCHEMA_SQL` in `db.py`
- [x] 1.2 Add `modified_by` column migration (try/except ALTER TABLE) in `init_db()`

## 2. Authorization helper

- [x] 2.1 Add `check_board_access(db, board_id, user_id) -> str | None` to `deps.py`
- [x] 2.2 Remove duplicated `_check_board_owner` from `lists/service.py` and boards module; replace all call sites with `check_board_access`

## 3. Board service — shared board support

- [x] 3.1 Update `get_boards()` to use UNION query returning both owned and member boards
- [x] 3.2 Update `get_boards()` to compute `isShared` (from name) and `isOwner` (from user_id)
- [x] 3.3 Update `get_board()` to use `check_board_access` instead of direct `user_id` comparison
- [x] 3.4 Update `update_board()` to reject rename that removes `$` from a shared board (409)
- [x] 3.5 Update `delete_board()` to reject non-owner (403)

## 4. Board models — response fields

- [x] 4.1 Add `isShared: bool` and `isOwner: bool` to `BoardResponse` in `boards/models.py`
- [x] 4.2 Update board router to populate `isShared` and `isOwner` in responses

## 5. List service — access refactoring

- [x] 5.1 Replace `_check_board_owner` calls in `create_list`, `update_list`, `delete_list`, `reorder_lists` with `check_board_access`

## 6. Card service — access refactoring + modified_by

- [x] 6.1 Replace `_check_list_owner` and `_check_card_owner` with `check_board_access`-based checks (resolve board_id from list_id or card_id first, then check access)
- [x] 6.2 Update `create_card()` to set `modified_by` to current user
- [x] 6.3 Update `update_card()` to set `modified_by` to current user
- [x] 6.4 Update `move_card()` to set `modified_by` to current user

## 7. Card models — response fields

- [x] 7.1 Add `modifiedBy: str | None = None` to `CardResponse` in `cards/models.py`
- [x] 7.2 Add `modifiedBy: str | None = None` to `CardBrief` in `lists/models.py`

## 8. Card service — return modified_by in reads

- [x] 8.1 Update `create_card()` return to include `modifiedBy`
- [x] 8.2 Update `update_card()` return to include `modifiedBy`
- [x] 8.3 Update `get_board()` in boards/service.py to include `modifiedBy` in card briefs

## 9. Member management module

- [x] 9.1 Create `nello/backend/src/members/__init__.py`
- [x] 9.2 Create `nello/backend/src/members/models.py` with `AddMemberRequest`, `MemberResponse`
- [x] 9.3 Create `nello/backend/src/members/service.py` with `add_member`, `remove_member`, `list_members`
- [x] 9.4 Create `nello/backend/src/members/router.py` with `POST /api/boards/{id}/members`, `DELETE /api/boards/{id}/members/{user_id}`, `GET /api/boards/{id}/members`

## 10. Main app wiring

- [x] 10.1 Register member router in `main.py`

## 11. Backend tests — members

- [x] 11.1 Create `nello/backend/tests/test_members.py` covering: add member, add to non-shared board (400), add non-existent user (404), add self (409), duplicate (409), non-owner cannot add (403), remove member, remove non-existent (404), non-owner cannot remove (403), list members, shared board appears in member's board list

## 12. Backend tests — updates for new fields

- [x] 12.1 Update `test_boards.py` assertions to include `isShared` and `isOwner` fields
- [x] 12.2 Update `test_cards.py` assertions to include `modifiedBy` field
- [x] 12.3 Update `test_lists.py` and `test_boards.py` for any cardinality or ownership assertions that changed with shared access

## 13. Verification

- [x] 13.1 Run `cd nello/backend && .venv/bin/pytest` — all tests pass
- [x] 13.2 Run `cd nello/frontend && npm test` — frontend tests still pass (backend-only change, no frontend modifications)
- [x] 13.3 Run `cd nello/frontend && npx tsc --noEmit` — TypeScript clean
