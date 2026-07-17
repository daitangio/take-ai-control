# User Stories — nello

## Authentication

### US-01: Magic Link Login
**As** a new or returning user  
**I want** to receive a one-time login link at my email  
**So that** I can access nello without a password

**Acceptance Criteria**:
- [ ] User enters email on login page
- [ ] System validates email against `allowed_email_domains_list` regexp patterns
- [ ] If rejected, user sees a clear "email domain not allowed" message
- [ ] If accepted, a magic link email is sent (link valid for 15 min, single-use)
- [ ] Clicking the link logs the user in and redirects to board list
- [ ] On first login, user account is auto-created (only email stored in DB)
- [ ] Expired or already-used links return a "link invalid or expired" message

---

## Boards

### US-02: Create a Board
**As** a logged-in user  
**I want** to create a new board with a name  
**So that** I can organize my work

**Acceptance Criteria**:
- [ ] User can create a board from the board list page
- [ ] Board requires a non-empty name
- [ ] Board appears in user's board list after creation

### US-03: Share a Board
**As** a board owner  
**I want** to invite another user by email to my board  
**So that** we can collaborate in real-time

**Acceptance Criteria**:
- [ ] Owner enters collaborator's email to share the board
- [ ] Collaborator sees the board in their board list after being added
- [ ] Non-owners cannot delete the board

---

## Lists

### US-04: Manage Lists
**As** a board member  
**I want** to create, rename, and delete lists on a board  
**So that** I can define workflow columns (e.g., To Do, In Progress, Done)

**Acceptance Criteria**:
- [ ] User can add a list with a name
- [ ] User can rename a list inline
- [ ] User can delete an empty list (or any list)
- [ ] Lists appear in creation order

---

## Cards

### US-05: Create and Edit a Card
**As** a board member  
**I want** to add cards to a list and fill in details  
**So that** I can track individual tasks

**Acceptance Criteria**:
- [ ] User can add a card (title required) to any list
- [ ] User can open a card and edit: title, description, due date, assignee
- [ ] Assignee is picked from board members

### US-06: Move and Reorder Cards
**As** a board member  
**I want** to drag cards between lists and reorder them within a list  
**So that** I can reflect current task status

**Acceptance Criteria**:
- [ ] Card can be dragged to a different list
- [ ] Card can be reordered within its list
- [ ] All collaborators see the move in real-time (no page refresh)

### US-07: Delete a Card
**As** a board member  
**I want** to delete a card  
**So that** I can remove completed or irrelevant tasks

**Acceptance Criteria**:
- [ ] User can delete a card from the card detail view
- [ ] Deletion is reflected in real-time for all collaborators

---

## Real-Time

### US-08: Live Board Updates
**As** a collaborator viewing a board  
**I want** to see changes made by others instantly  
**So that** I always have an up-to-date view

**Acceptance Criteria**:
- [ ] Any create/update/delete/move action broadcasts to all connected clients on the same board
- [ ] Updates applied without full page reload
- [ ] WebSocket connection drops gracefully (reconnect attempt shown)
