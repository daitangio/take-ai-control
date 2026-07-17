# Application Design — nello

## Components

### Backend (apps/tbe/)

| Component | Responsibility |
|-----------|---------------|
| `AuthController` | Magic-link request + validation endpoints |
| `TokenService` | Generate, store, validate, expire magic-link tokens |
| `UserService` | Auto-create user on first login; email domain validation |
| `BoardController` | CRUD for boards; share/invite collaborators |
| `BoardService` | Board business logic, permission checks |
| `ListController` | CRUD for lists within a board |
| `ListService` | List ordering, business rules |
| `CardController` | CRUD for cards; move between lists |
| `CardService` | Card ordering, assignee resolution, move logic |
| `WebSocketBroadcaster` | Broadcast board events to connected STOMP clients |
| `AuditListener` | Hibernate Envers / event listener — writes audit records |

### Frontend (apps/nello-frontend/)

| Component | Responsibility |
|-----------|---------------|
| `LoginPage` | Email input → magic link request |
| `MagicLinkCallbackPage` | Receives token from URL, completes login |
| `BoardListPage` | Shows all boards; create board action |
| `BoardPage` | Renders lists + cards; drag-and-drop root |
| `ListColumn` | Renders a single list with its cards; add-card action |
| `CardItem` | Compact card tile (title, due badge, assignee avatar) |
| `CardDetailModal` | Full card edit form (title, desc, due date, assignee) |
| `ShareBoardModal` | Invite collaborator by email |
| `useWebSocket` | Hook — connect to STOMP, subscribe to board topic, dispatch updates |
| `authStore` | Zustand/Context store for current user session |
| `boardStore` | Local state for current board (lists + cards), updated via WebSocket |

---

## Service Layer

### Backend Services

```
AuthController → TokenService → DB (magic_link_tokens)
                             → EmailSender (SMTP / mock)
             → UserService  → DB (users — email only)

BoardController → BoardService → DB (boards, board_members)
                              → WebSocketBroadcaster

ListController  → ListService  → DB (lists)
                              → WebSocketBroadcaster

CardController  → CardService  → DB (cards)
                              → WebSocketBroadcaster

AuditListener (Hibernate Envers) → DB (audit tables — auto-generated)
```

### Frontend Data Flow

```
LoginPage → POST /auth/request-link → email sent
MagicLinkCallback → POST /auth/verify-token → JWT/session cookie returned
BoardPage → GET /boards/{id} → lists + cards snapshot
         → WebSocket SUBSCRIBE /topic/board/{id} → live delta updates
         → DnD drag end → PATCH /cards/{id}/move → broadcasts via WS
```

---

## Component Dependencies

```
CardController  depends-on  CardService, WebSocketBroadcaster
ListController  depends-on  ListService, WebSocketBroadcaster
BoardController depends-on  BoardService, WebSocketBroadcaster
AuthController  depends-on  TokenService, UserService
TokenService    depends-on  DB, EmailSender
UserService     depends-on  DB, allowed_email_domains_list (config)
AuditListener   depends-on  DB (Hibernate Envers auto-wired)
```

---

## Key Design Decisions

- **Auth**: Spring Security filter validates a short-lived JWT (or session) issued after magic-link verification. No Basic Auth in production flows.
- **Token storage**: `magic_link_tokens` table (token_hash, email, expires_at, used). Token is hashed before storage.
- **WebSocket**: STOMP over WebSocket. Topic per board: `/topic/board/{boardId}`. Messages are full-delta JSON events (type + payload).
- **Card ordering**: `position` integer column (sparse, e.g. 1000 gaps). Reorder = update positions of affected cards.
- **Audit**: Hibernate Envers `@Audited` on `Board`, `List`, `Card` entities. Revision table auto-created by Liquibase changeset.
