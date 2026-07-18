# Code Generation Plan — Unit 1: tbe (Backend)

## Steps (re-generated for H2 — 2026-07-18)

- [x] 1. Scaffold Maven project (`apps/tbe/`) with `mvnw`, `pom.xml`
  - [x] 1.1 Spring Boot 3.5.3 parent, Java 25, H2 (runtime), hibernate-envers, liquibase-core, java-jwt, lombok 1.18.38, junit5
- [x] 2. `application.properties` — H2 file datasource, `nello.*` config properties, mail, Liquibase enabled, ddl-auto=none
- [x] 3. Liquibase SQL changelogs (`db/changelog/`)
  - [x] 3.1 `001-users.sql`
  - [x] 3.2 `002-magic-link-tokens.sql`
  - [x] 3.3 `003-boards.sql`
  - [x] 3.4 `004-lists.sql`
  - [x] 3.5 `005-cards.sql`
  - [x] 3.6 `006-envers-audit.sql` — revinfo + sequence + audited tables
- [x] 4. JPA Entities: `User`, `MagicLinkToken`, `Board`, `BoardMember`, `BoardList`, `Card`, `NelloRevision`
- [x] 5. Spring Data Repositories for all entities
- [x] 6. `auth/` package — EmailDomainValidator, TokenService, JwtService, UserService, EmailSender, JwtAuthFilter, AuthController
- [x] 7. `config/` package — `SecurityConfig`, `AppProperties`
- [x] 8. `ws/` package — `WebSocketConfig`, `BoardEvent`, `WebSocketBroadcaster`
- [x] 9. `board/` package — Board, BoardMember, BoardService, BoardController
- [x] 10. `list/` package — BoardList, ListService, ListController
- [x] 11. `card/` package — Card, CardService, CardController (move endpoint included)
- [x] 12. `audit/` package — NelloRevision (SEQUENCE-based, no DefaultRevisionEntity), NelloRevisionListener
- [x] 13. JUnit 5 tests (in-memory H2)
  - [x] 13.1 `EmailDomainValidatorTest` (3 tests)
  - [x] 13.2 `TokenServiceTest` (4 tests)
  - [x] 13.3 `CardServiceTest` (2 tests — append position + renumber on collision)
- [x] 14. Verified: `mvn test` → 9/9 pass; `spring-boot:run` starts in ~2s
