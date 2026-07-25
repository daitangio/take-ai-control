## 1. Database

- [x] 1.1 Add `color TEXT` column to `card` table via `apply_migrations` in `backend/src/db.py`

## 2. Backend API

- [x] 2.1 Add `color: str | None = None` field to `CardUpdate` and `CardResponse` models in `backend/src/cards/models.py`
- [x] 2.2 Pass `color` through `update_card()` service function in `backend/src/cards/service.py` and include it in `_card_response()`
- [x] 2.3 Accept and return `color` in `PATCH /cards/{card_id}` route handler in `backend/src/cards/router.py`

## 3. Frontend API Layer

- [x] 3.1 Add `color` field to `CardBrief` and `CardResponse` interfaces in `frontend/src/api.ts`
- [x] 3.2 Add `color?: string | null` parameter to `updateCard()` function and include in request body when provided

## 4. Frontend State

- [x] 4.1 Add `color?: string | null` to `Card` interface in `frontend/src/state/types.ts`
- [x] 4.2 Add `color` to `card/create` and `card/edit` action types in `frontend/src/state/types.ts`
- [x] 4.3 Handle `color` in reducer `card/create` and `card/edit` cases in `frontend/src/state/reducer.ts`
- [x] 4.4 Pass `color` through `actionToApiCall()` for `card/edit` in `frontend/src/state/StoreContext.tsx`
- [x] 4.5 Include `color` when hydrating cards from API in `loadBoards()` in `frontend/src/state/StoreContext.tsx`

## 5. Frontend UI — CardTile

- [x] 5.1 Update `updateDueDate` helper (or create a new helper) in `CardTile.tsx` to dispatch `card/edit` with color
- [x] 5.2 Add color swatch buttons (6 colors + clear `✕`) as the first row in the action popup, above Details
- [x] 5.3 Add a visual separator between the color swatch row and the existing menu items
- [x] 5.4 Apply card color as inline `background` style on the `.card-tile` div, falling back to `#fff` when no color is set

## 6. Frontend CSS

- [x] 6.1 Add styles for color swatch buttons (size, border-radius, hover, active state) in `frontend/src/components/ListColumn.css`
- [x] 6.2 Add style for the popup separator row

## 7. Verification

- [x] 7.1 Run existing tests (`npm test` in frontend) to verify no regressions
- [x] 7.2 Run existing backend tests to verify no regressions
- [x] 7.3 Manually verify: set color on a card, reload page, confirm color persists
- [x] 7.4 Manually verify: clear a card color, confirm it reverts to white
- [x] 7.5 Manually verify: color survives archive/unarchive cycle
- [x] 7.6 Apply card color as background on the modal title input in `CardModal.tsx`
