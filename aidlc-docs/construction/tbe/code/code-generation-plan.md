# Code Generation Plan — Unit 1: tbe (Backend)

## Steps

- [ ] 1. Scaffold Maven project (`apps/tbe/`) with `mvnw`, `pom.xml`
  - [ ] 1.1 Spring Boot 3.x parent, Java 25, dependencies: spring-boot-starter-web, spring-boot-starter-websocket, spring-boot-starter-security, spring-boot-starter-data-jpa, hibernate-envers, liquibase-core, sqlite-jdbc, hibernate-community-dialects, jjwt (auth0 java-jwt), spring-boot-starter-mail, lombok, junit5
- [ ] 2. `application.properties` — SQLite datasource, `allowed_email_domains_list`, `jwt.secret`, `jwt.expiry-minutes=60`, mail config, Liquibase enabled, ddl-auto=none
- [ ] 3. Liquibase changelogs (`db/changelog/`)
  - [ ] 3.1 `001-users.xml` — users table
  - [ ] 3.2 `002-magic-link-tokens.xml` — magic_link_tokens table
  - [ ] 3.3 `003-boards.xml` — boards + board_members tables
  - [ ] 3.4 `004-lists.xml` — board_lists table
  - [ ] 3.5 `005-cards.xml` — cards table
  - [ ] 3.6 `006-envers-audit.xml` — revinfo + audited revision tables
- [ ] 4. JPA Entities: `User`, `MagicLinkToken`, `Board`, `BoardMember`, `BoardList`, `Card`, `NelloRevision`
- [ ] 5. Spring Data Repositories for all entities
- [ ] 6. `auth/` package
  - [ ] 6.1 `EmailDomainValidator` — reads `allowed_email_domains_list`, evaluates regexps
  - [ ] 6.2 `TokenService` — generate/hash/store/verify magic-link tokens
  - [ ] 6.3 `JwtService` — issue/validate JWT
  - [ ] 6.4 `UserService` — findOrCreate by email
  - [ ] 6.5 `EmailSender` — send magic link email (+ `MockEmailSender` for dev)
  - [ ] 6.6 `JwtAuthFilter` — OncePerRequestFilter
  - [ ] 6.7 `AuthController` — POST /auth/request-link, POST /auth/verify-token
- [ ] 7. `config/` package — `SecurityConfig`, `AppProperties` (@ConfigurationProperties)
- [ ] 8. `ws/` package — `WebSocketConfig`, `BoardEvent` record, `WebSocketBroadcaster`
- [ ] 9. `board/` package — `Board`, `BoardMember` entities (if not in step 4), `BoardService`, `BoardController`
- [ ] 10. `list/` package — `BoardList` entity, `ListService`, `ListController`
- [ ] 11. `card/` package — `Card` entity, `CardService`, `CardController` (including move endpoint)
- [ ] 12. `audit/` package — `NelloRevisionListener`, `NelloRevision`
- [ ] 13. JUnit 5 tests
  - [ ] 13.1 `EmailDomainValidatorTest`
  - [ ] 13.2 `TokenServiceTest`
  - [ ] 13.3 `CardServiceTest` (reorder + move logic)
  - [ ] 13.4 `BoardControllerIT` (Spring Boot integration test)
- [ ] 14. Update `LOG.md` with progress
