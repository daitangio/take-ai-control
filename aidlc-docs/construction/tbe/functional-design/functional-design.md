# Functional Design — tbe (Backend)

## Data Model

### Entity: User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL — only identifier stored |
| created_at | TIMESTAMP | auto |

### Entity: MagicLinkToken
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| token_hash | VARCHAR(64) | SHA-256 of raw token; UNIQUE |
| email | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMP | created_at + 15 min |
| used | BOOLEAN | default false |

### Entity: Board
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| owner_id | UUID | FK → User |
| created_at | TIMESTAMP | |

### Entity: BoardMember
| Field | Type | Notes |
|-------|------|-------|
| board_id | UUID | FK → Board |
| user_id | UUID | FK → User |
| PK | (board_id, user_id) | composite |

### Entity: BoardList
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| board_id | UUID | FK → Board |
| name | VARCHAR(255) | NOT NULL |
| position | INTEGER | ordering (gaps of 1000) |

### Entity: Card
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| list_id | UUID | FK → BoardList |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | nullable |
| due_date | DATE | nullable |
| assignee_id | UUID | FK → User; nullable |
| position | INTEGER | ordering within list |
| created_at | TIMESTAMP | |

---

## Business Rules

### BR-1: Email Domain Validation
- On magic-link request: extract domain from email
- Evaluate against each regexp in `allowed_email_domains_list` (comma-separated in `application.properties`)
- Reject if no pattern matches → HTTP 403 + message

### BR-2: Magic Link Lifecycle
1. Generate cryptographically random 32-byte token
2. Store SHA-256 hash in `magic_link_tokens`; send raw token in email link
3. On verify: hash incoming token, lookup by hash
4. Reject if: not found, `used=true`, or `expires_at < now()`
5. On success: mark `used=true`, issue JWT, auto-create `User` if first login

### BR-3: Board Permissions
- Only board owner or board members can view/edit a board
- Only owner can add/remove members and delete the board
- Any member can create/edit/delete lists and cards

### BR-4: Card/List Ordering
- `position` stored with gaps (1000, 2000, …)
- On reorder: recalculate only affected rows; if gaps exhausted, renumber all items in list
- Move between lists: update `list_id` + `position`

### BR-5: WebSocket Broadcast
- After any mutating operation (create/update/delete/move) the service publishes a `BoardEvent` to `/topic/board/{boardId}`
- Event payload: `{ type, entityType, payload }` — full updated object on create/update; id only on delete
