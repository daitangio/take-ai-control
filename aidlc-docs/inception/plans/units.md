# Units of Work — nello

## Unit 1: tbe (Backend)
- **Location**: `apps/tbe/`
- **Tech**: Java 25, Spring Boot, Hibernate 7.4, SQLite, Liquibase, Maven, JUnit 5
- **Scope**:
  - Maven project scaffold (`mvnw`, `pom.xml`)
  - Liquibase migrations: users, boards, board_members, lists, cards, magic_link_tokens, Envers audit tables
  - JPA Entities: `User`, `Board`, `BoardMember`, `BoardList`, `Card`, `MagicLinkToken`
  - Repositories (Spring Data JPA)
  - Services: `TokenService`, `UserService`, `BoardService`, `ListService`, `CardService`
  - REST Controllers: `AuthController`, `BoardController`, `ListController`, `CardController`
  - WebSocket config + `WebSocketBroadcaster`
  - Spring Security config (JWT filter, permitAll on `/auth/**`)
  - Hibernate Envers audit setup
  - `application.properties` with `allowed_email_domains_list`, SQLite datasource, default credentials
  - JUnit 5 tests for services and controllers

## Unit 2: nello-frontend (Frontend)
- **Location**: `apps/nello-frontend/`
- **Tech**: Vite, React 18, TypeScript, @dnd-kit/core, @stomp/stompjs
- **Scope**:
  - Vite scaffold (`vite.config.ts`, `tsconfig.json`, `package.json`)
  - Pages: `LoginPage`, `MagicLinkCallbackPage`, `BoardListPage`, `BoardPage`
  - Components: `ListColumn`, `CardItem`, `CardDetailModal`, `ShareBoardModal`
  - Hooks: `useWebSocket`, `useBoard`
  - State: `authStore`, `boardStore` (Zustand or React Context)
  - API client (`src/api/`) for all REST calls
  - React Router v6 routing
  - CSS: minimal utility-first styles (Tailwind CSS or plain CSS modules)
  - Unit tests (Vitest + React Testing Library) for key components

## Build Order
1. **Unit 1 (tbe)** first — defines all REST + WebSocket contracts
2. **Unit 2 (nello-frontend)** second — consumes those contracts
