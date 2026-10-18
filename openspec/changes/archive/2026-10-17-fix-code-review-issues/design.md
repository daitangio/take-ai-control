# Design

## Overview

This change consists of two independent workstreams that can be implemented separately:

1. **Code Cleanup** - Remove unused persistence infrastructure
2. **API Compliance** - Fix DELETE request semantics

## Workstream 1: Remove Unused Code

### Current State
```
src/state/
├── usePersistedReducer.ts    # UNUSED
├── storage.ts                # UNUSED
├── storage.test.ts           # UNUSED
└── StoreContext.tsx          # ACTIVE (does not use persistence)
```

### Implementation

Simple file deletion:
```bash
rm src/state/usePersistedReducer.ts
rm src/state/storage.ts
rm src/state/storage.test.ts
```

### Why This Was Created But Never Used

The persistence infrastructure appears to have been created for localStorage persistence of application state, but the `StoreContext` ended up using its own internal state management without connecting to the persistence layer. The `usePersistedReducer` hook was never imported or used anywhere.

### Rollback Considerations

- Files can be restored from git history if needed
- No other code depends on these files

## Workstream 2: Fix DELETE Request Bodies

### Current Implementation

```typescript
// DELETE with body (INCORRECT)
export function deleteBoard(boardId: string) {
  return fetchWithAuth<void>(`/boards/${boardId}`, { 
    method: "DELETE", 
    body: JSON.stringify({ boardId }) 
  });
}
```

### New Implementation

```typescript
// DELETE without body (CORRECT)
export function deleteBoard(boardId: string) {
  return fetchWithAuth<void>(`/boards/${boardId}`, { 
    method: "DELETE" 
  });
}
```

### Affected Functions

All in `src/api.ts`:
1. `deleteBoard` - line ~145
2. `deleteList` - line ~165
3. `deleteCard` - line ~205
4. `archiveCard` - line ~210
5. `removeCardMember` - line ~235
6. `removeMember` - line ~250

### Backend Compatibility

The backend should already support DELETE requests without bodies since:
- The route parameter (`/boards/:id`) provides the identifier
- The body is redundant (contains the same ID)
- This is standard REST convention

### Testing Strategy

1. Verify existing tests still pass
2. Manual testing of delete operations in UI
3. Confirm backend receives requests correctly

## Order of Implementation

1. **First:** Remove unused code (safe, no functional impact)
2. **Second:** Fix DELETE requests (requires verification of backend compatibility)

Both can be done in parallel as they don't affect each other.

## Risk Assessment

| Change | Risk Level | Rollback Difficulty |
|--------|------------|---------------------|
| Remove unused code | Low | Easy (git revert) |
| Remove DELETE bodies | Low-Medium | Easy (git revert) |

## Dependencies

- No external dependencies
- Requires backend to accept DELETE without body (already does)
