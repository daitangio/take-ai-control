# Requirements Document — nello

## Intent Analysis

- **User Request**: Build "nello", a Trello-clone web application
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: Cross-system (React frontend + Java backend, multi-user, real-time)
- **Complexity Estimate**: Moderate-Complex

---

## Functional Requirements

### FR-1: Authentication — Passwordless Magic Link
- Users authenticate via **email magic link only** — no passwords
- On login attempt, system sends a one-time link to the user's email
- Link expires after **15 minutes**; single use
- On first successful link click, user account is **auto-created** in the database
- **Only the email address** is stored in the database — no password, no username field
- Application property `allowed_email_domains_list` (in `application.properties`) defines a list of **email regexp patterns**; only matching emails are accepted

### FR-2: Boards
- Users can create multiple boards
- Boards can be **shared** with other users (collaborators)
- Multiple users can simultaneously view and edit the same board
- Board has: name, owner (email), list of collaborators

### FR-3: Lists
- A board contains ordered lists (columns)
- Users can create, rename, and delete lists
- Lists can be reordered within a board

### FR-4: Cards
- Lists contain ordered cards
- Card fields: **title** (required), **description** (optional), **due date** (optional), **assignee** (optional — another user)
- Cards can be **moved between lists** (drag-and-drop)
- Cards can be **reordered within a list** (drag-and-drop)
- Cards can be created, edited, and deleted

### FR-5: Real-Time Collaboration
- All connected users on the same board receive **instant updates** when any change occurs (new card, move, rename, delete)
- Transport: **WebSocket** (Spring WebSocket / STOMP)

### FR-6: Audit / Activity Log
- All significant actions (card create/move/delete, list create/delete, board share) are logged
- Stored in the **database only** — no dedicated REST API endpoint and no UI panel
- Use **Hibernate Envers** (or standard Hibernate event listeners) for audit trail

---

## Non-Functional Requirements

### NFR-1: Tech Stack — Backend
- Language: **Java 25**
- Framework: **Spring Boot** + **Hibernate 7.4**
- Database: **H2** managed via **Liquibase**
- Security: **Spring Security** (magic-link flow replacing basic auth default)
- Testing: **JUnit 5**
- Build: **Maven** with maven wrapper to install
- Location: `apps/tbe/`

### NFR-2: Tech Stack — Frontend
- Tooling: **Vite + React + TypeScript**
- Drag-and-Drop: **@dnd-kit/core**
- Real-time: WebSocket client (native or `@stomp/stompjs`)
- Location: `apps/nello-frontend/`

### NFR-3: Design Philosophy
- UI must be **simple and compact** — minimal chrome, clean layout
- No unnecessary UI panels for logs/audit

### NFR-4: Extensions
- Security Baseline: **Disabled** (prototype-grade)
- Resiliency Baseline: **Disabled**
- Property-Based Testing: **Disabled**

### NFR-5: Database Extra GG Guidelines
- Prefer SQL DDL files to init datbase
- For unit testing relay on in-memory H2 database 

### NFR-6: Library to be included in Tech Stack — Backend
- lombok.version: 1.18.38

---

## Key Constraints
- No password or username stored in the database — email is the sole user identifier
- `allowed_email_domains_list` is the access-control gate at registration time
- Magic link tokens must be stored temporarily (DB or in-memory cache) and invalidated after use or expiry
