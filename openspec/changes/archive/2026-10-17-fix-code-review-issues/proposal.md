# Proposal: Fix Code Review Issues

## Summary

Address two critical findings from the code review of `nello/frontend`:

1. **Remove unused code** - The `usePersistedReducer` hook and `storage.ts` infrastructure were implemented but never used
2. **Remove DELETE request bodies** - Multiple DELETE endpoints incorrectly include request bodies, violating HTTP semantics

## Motivation

### Issue 1: Unused Code
- `src/state/usePersistedReducer.ts` - Complete unused hook (~100 lines)
- `src/state/storage.ts` - Unused localStorage adapter with versioning (~120 lines)
- `src/state/storage.test.ts` - Tests for unused code (~200 lines)
- **Total: ~420 lines of dead code**
- Adds maintenance burden, increases bundle size, confuses developers

### Issue 2: Semantically Incorrect DELETE Requests
- HTTP DELETE requests should not have bodies according to RFC 7231
- Current code sends bodies with: `deleteBoard`, `deleteList`, `deleteCard`, `archiveCard`, `archiveList`, `removeCardMember`, `removeMember`
- Some API gateways/proxies may reject these requests
- Backend may work but it's semantically incorrect

## Goals

- Remove all unused code to reduce maintenance overhead
- Fix HTTP compliance issues
- Maintain all existing functionality
- Keep changes minimal and focused

## Non-Goals

- Adding new features
- Refactoring working code beyond the two issues
- Changing the backend API

## Success Criteria

- [ ] All unused files removed from codebase
- [ ] All DELETE requests have no body parameter
- [ ] All existing tests still pass
- [ ] Build succeeds without errors
