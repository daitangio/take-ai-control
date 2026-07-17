# NFR Requirements — tbe (Backend)

## NFR-1: Security
- Magic-link tokens stored as SHA-256 hash only (raw token never persisted)
- JWT signed with HS256; secret in `application.properties` (`jwt.secret`)
- Spring Security: all endpoints require valid JWT except `POST /auth/request-link` and `POST /auth/verify-token`
- CORS configured to allow frontend origin only

## NFR-2: Real-Time (WebSocket)
- Spring WebSocket + STOMP protocol
- Topic namespace: `/topic/board/{boardId}`
- Message broker: in-memory (SimpleBroker — SQLite/embedded, no external broker needed)
- Broadcast latency target: < 200 ms under normal load

## NFR-3: Audit Logging
- Hibernate Envers `@Audited` on `Board`, `BoardList`, `Card` entities
- `RevisionEntity` stores: revision number, timestamp, author email
- Audit tables created via Liquibase changeset (not auto-DDL)

## NFR-4: Data Integrity
- Liquibase manages all schema changes (no `spring.jpa.hibernate.ddl-auto=update`)
- Foreign key constraints enforced via SQLite PRAGMA foreign_keys=ON
- Soft deletes NOT used — hard delete with cascade

## NFR-5: Testability
- JUnit 5 + Mockito for unit tests
- Spring Boot Test (`@SpringBootTest`) for integration tests
- H2 in-memory or SQLite test DB for integration tests
