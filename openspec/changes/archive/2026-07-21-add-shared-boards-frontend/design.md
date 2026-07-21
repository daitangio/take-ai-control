## Context

The nello frontend is a React + TypeScript SPA using a normalized reducer (useReducer + Context) with optimistic API dispatching. The backend just gained shared board support (board_member table, member endpoints, `isShared`/`isOwner` response fields, card `modifiedBy`). This change adds the frontend UI.

**Constraints:**
- Same tech stack: React 19, TypeScript strict, Vite, @dnd-kit for drag & drop
- API client pattern: `fetchWithAuth()` helper with JWT Bearer token
- Component structure: `BoardSwitcher` (tabs), `BoardView` (lists/cards), `CardModal` (card detail)
- Style: inline styles + CSS classes (no CSS-in-JS library)

## Goals / Non-Goals

**Goals:**
- Show share button (👤) on shared boards where user is owner
- Member dialog: list members, add by email, remove (owner only)
- Show `modifiedBy` in card modal when present
- Pass `isShared`/`isOwner`/`modifiedBy` through API types and state

**Non-Goals:**
- User profile display (showing user email/name instead of user ID for modifiedBy)
- Real-time member presence
- Email notifications
- Board role editing (owner transfer, admin promotion)

## Decisions

### 1. Member dialog as a modal

A simple modal overlay similar to `CardModal`. Contains:
- Member list (email + remove button per member)
- "Add member" form: email input + add button
- Close button

Open state managed via a `sharingBoardId` state in `BoardSwitcher`. When set, renders `MemberDialog` inside the component.

### 2. Share button placement

A 👤 emoji button appears next to the rename/edit buttons on each board tab, only when `board.isShared && board.isOwner`. Clicking opens the member dialog for that board.

### 3. modifiedBy display

In `CardModal`, show a small muted text line below the description:
> Last modified by: `<user_id>`

For now, show the raw user ID. A future change could resolve user IDs to emails/names.

### 4. Type changes

```typescript
// types.ts
export interface Board {
  id: BoardId;
  name: string;
  listIds: ListId[];
  isShared?: boolean;
  isOwner?: boolean;
}

export interface Card {
  id: CardId;
  title: string;
  description: string;
  modifiedBy?: string;
}

// api.ts — match backend response shapes
export interface BoardBrief {
  id: string;
  name: string;
  listIds: string[];
  isShared: boolean;
  isOwner: boolean;
}

export interface CardBrief {
  id: string;
  title: string;
  description: string;
  modifiedBy: string | null;
}

export interface CardResponse {
  id: string;
  listId: string;
  title: string;
  description: string;
  modifiedBy: string | null;
}
```

### 5. loadBoards needs to pass new fields through

Currently `loadBoards` dispatches `board/create` and `card/create` but doesn't pass the new fields. The reducer already accepts arbitrary fields on those actions... wait, no, the reducer uses typed actions:

```typescript
| { type: 'board/create'; boardId: BoardId; name: string }
| { type: 'card/create'; cardId: CardId; listId: ListId; title: string }
```

These don't include `isShared`/`isOwner`/`modifiedBy`. Two options:
- **A)** Extend the action types — more correct but touches reducer and tests
- **B)** After loading, separately set these as "cosmetic" state fields — hacky

Option A is the right call. Add optional fields to the actions:

```typescript
| { type: 'board/create'; boardId: BoardId; name: string; isShared?: boolean; isOwner?: boolean }
| { type: 'card/create'; cardId: CardId; listId: ListId; title: string; modifiedBy?: string }
```

The reducer then spreads these into the created entities.

### 6. Why optional fields on state types

`isShared`/`isOwner` are optional on `Board` because boards loaded from localStorage (if ever restored) won't have them. Same for `modifiedBy` on `Card` — pre-existing cards don't have it. This avoids migration headaches.

## Risks / Trade-offs

- [Member dialog needs to fetch members on open] → Each open triggers a GET request. Fine for demo scale.
- [No user email lookup for modifiedBy] → Shows raw UUID, which is ugly but functional. Easy to improve later.
- [Action type changes touch reducer tests] → Minor mechanical updates to 2-3 test assertions.

## Open Questions

- None.
