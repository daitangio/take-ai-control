# Specifications

## Functional Requirements

### 1. Remove Unused Code

The following files MUST be deleted:
- `src/state/usePersistedReducer.ts`
- `src/state/storage.ts`
- `src/state/storage.test.ts`

**Verification:**
- Files do not exist in the repository
- No imports reference these files
- Build completes successfully

### 2. Remove DELETE Request Bodies

The following API functions in `src/api.ts` MUST be modified to remove the `body` parameter from DELETE requests:

- `deleteBoard(boardId: string)` - Remove `body: JSON.stringify({ boardId })`
- `deleteList(listId: string)` - Remove `body: JSON.stringify({ listId })`
- `deleteCard(cardId: string)` - Remove `body: JSON.stringify({ cardId })`
- `archiveCard(cardId: string)` - Remove `body: JSON.stringify({ cardId })`
- `archiveList(listId: string)` - Remove `body: JSON.stringify({ listId })`
- `removeCardMember(cardId: string, memberId: string)` - Remove `body: JSON.stringify({ memberId })`
- `removeMember(boardId: string, memberId: string)` - Remove `body: JSON.stringify({ memberId })`

**Note:** The `body` parameter in `archiveList` is currently sent to `/lists/${listId}/delete-all` with POST method, which is correct. Only the DELETE method calls need fixing.

**Verification:**
- All DELETE requests have no body parameter
- All POST requests maintain their bodies
- API functionality remains unchanged

## Technical Requirements

- Changes must not break any existing tests
- Changes must not introduce new warnings or errors
- Code must maintain TypeScript type safety
- No changes to backend API contracts

## Edge Cases

- Ensure that the backend can handle DELETE requests without bodies (it already should)
- Verify that existing tests for these endpoints still pass
