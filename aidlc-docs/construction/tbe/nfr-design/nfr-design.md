# NFR Design — tbe (Backend)

## Design Pattern: JWT Auth Filter
```
Request → JwtAuthFilter (OncePerRequestFilter)
           → extract Bearer token from Authorization header
           → validate signature + expiry
           → set SecurityContext (email as principal)
           → chain.doFilter()
```
- Filter skips `/auth/**` paths
- On failure: 401 Unauthorized

## Design Pattern: Magic Link Flow
```
POST /auth/request-link  { email }
  → EmailDomainValidator.validate(email)   // BR-1
  → TokenService.createToken(email)        // BR-2 steps 1-2
  → EmailSender.sendMagicLink(email, rawToken)
  → 200 OK (no body — never reveal whether email exists)

POST /auth/verify-token  { token }
  → TokenService.verifyToken(token)        // BR-2 steps 3-5
  → UserService.findOrCreate(email)
  → JwtService.issue(email)
  → 200 OK { jwt }
```

## Design Pattern: WebSocket Broadcast
```java
// After any service mutation:
broadcaster.send(boardId, new BoardEvent(type, entityType, payload));

// Config:
@Configuration @EnableWebSocketMessageBroker
WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  registerStompEndpoints("/ws")
  configureMessageBroker: enableSimpleBroker("/topic"), appDestinationPrefixes("/app")
}
```

## Design Pattern: Hibernate Envers Audit
```java
@Entity @Audited
class Card { ... }

@RevisionEntity(NelloRevisionListener.class)
class NelloRevision extends DefaultRevisionEntity {
  String authorEmail;
}
// NelloRevisionListener sets authorEmail from SecurityContext
```

## Design Pattern: Position-Based Ordering
- New item appended: `position = max(existing positions) + 1000`
- Reorder: update `position` of moved item to midpoint between neighbours
- Renumber trigger: when gap < 1 (collision), renumber all items `1000, 2000, …`

## Package Structure
```
apps/tbe/src/main/java/io/nello/tbe/
  auth/          AuthController, TokenService, UserService, JwtService,
                 EmailDomainValidator, EmailSender, JwtAuthFilter
  board/         BoardController, BoardService, Board, BoardMember
  list/          ListController, ListService, BoardList
  card/          CardController, CardService, Card
  ws/            WebSocketConfig, WebSocketBroadcaster, BoardEvent
  audit/         NelloRevision, NelloRevisionListener
  config/        SecurityConfig, AppProperties
```
