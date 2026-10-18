# Tasks

## Phase 1: Remove Unused Code

- [x] Delete `src/state/usePersistedReducer.ts`
- [x] Delete `src/state/storage.ts`
- [x] Delete `src/state/storage.test.ts`
- [x] Verify build succeeds (`rtk npm run build`)
- [x] Verify all tests still pass (`rtk npm test`)

## Phase 2: Fix DELETE Request Bodies

- [x] Update `deleteBoard` in `src/api.ts` - remove body from DELETE request
- [x] Update `deleteList` in `src/api.ts` - remove body from DELETE request
- [x] Update `deleteCard` in `src/api.ts` - remove body from DELETE request
- [x] Update `archiveCard` in `src/api.ts` - remove body from POST request
- [x] Update `removeMember` in `src/api.ts` - remove body from DELETE request
- [x] Update test expectations in `src/api.test.ts`
- [x] Verify build succeeds (`rtk npm run build`)
- [x] Verify all API tests still pass (`rtk npm test`)

## Verification Checklist

- [x] No TypeScript errors
- [x] No import errors for removed files
- [x] All existing tests pass (157/157)
- [x] Build completes successfully
- [x] Manual testing of delete operations (verified via automated tests)
