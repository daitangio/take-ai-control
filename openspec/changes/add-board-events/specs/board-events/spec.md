## Purpose

Defines the server-to-client push channel that keeps every viewer's board up to date within a configurable interval (default 3 seconds) of a change, with independent kill switches per side.

## ADDED Requirements

### Requirement: Board changes are pushed within the configured interval
The system SHALL notify every subscribed client of a successful board mutation within the configured event interval (`NELLO_EVENTS_INTERVAL_SECONDS`, default 3 seconds) of the mutation being committed.

#### Scenario: Change visible to another viewer
- **WHEN** user A successfully mutates a board (card, list, board, or member change) and user B is subscribed to that board's event stream
- **THEN** user B receives an event for that board within the configured interval
- **AND** the event identifies only the board, the acting user, and a timestamp

#### Scenario: Burst of changes is coalesced
- **WHEN** several mutations hit the same board within one interval
- **THEN** subscribers receive at most one event for that board per interval
- **AND** the event reflects the latest mutation

#### Scenario: Failed mutation emits nothing
- **WHEN** a mutation fails validation or authorization
- **THEN** no event is emitted for that board

#### Scenario: No subscribers
- **WHEN** a board changes and no client is subscribed to its stream
- **THEN** no event is delivered and the server is unaffected

### Requirement: Subscription is restricted to board members
The system SHALL allow only the board owner or a board member to open the board's event stream.

#### Scenario: Authorized subscriber opens the stream
- **WHEN** an authenticated owner or member of the board opens the stream
- **THEN** the stream stays open and receives events for that board

#### Scenario: Non-member opens the stream
- **WHEN** a user who is neither owner nor member of the board opens the stream
- **THEN** the request is rejected with 404

#### Scenario: Unauthenticated subscription
- **WHEN** a client without a valid credential opens the stream
- **THEN** the request is rejected with 401

### Requirement: Stream authentication uses a short-lived ticket
The system SHALL authenticate event-stream connections with a short-lived opaque ticket so the JWT never appears in a URL.

#### Scenario: Ticket issued
- **WHEN** an authenticated user requests a subscription ticket
- **THEN** the system returns an opaque ticket that is not the user's JWT
- **AND** the ticket expires after a short lifetime

#### Scenario: Invalid or expired ticket
- **WHEN** a client opens a stream with an unknown or expired ticket
- **THEN** the request is rejected with 401

### Requirement: Store refreshes the active board on event
The store SHALL refetch the active board through the existing board detail request when it receives an event for that board.

#### Scenario: Remote change while viewing the board
- **WHEN** a subscribed client receives an event for its active board
- **THEN** the store refetches that board and displays the updated content
- **AND** lists and cards of other boards are left untouched

#### Scenario: Event for a non-active board
- **WHEN** a client receives an event for a board it is not currently viewing
- **THEN** the client ignores the event and does not refetch

#### Scenario: Own change from another tab
- **WHEN** a client receives an event caused by the same user's change in another tab
- **THEN** the client still refetches, so all tabs of the same user stay in sync

### Requirement: Feature can be disabled per side
The system SHALL support disabling the event feature independently on the backend and on the frontend.

#### Scenario: Backend feature disabled
- **WHEN** the backend runs with the event feature disabled
- **THEN** the stream and ticket endpoints are not registered
- **AND** every mutation continues to work exactly as before
- **AND** no event is emitted

#### Scenario: Frontend feature disabled
- **WHEN** the frontend is built with the event feature disabled
- **THEN** it opens no subscription and the app works normally

#### Scenario: Frontend enabled against a disabled backend
- **WHEN** a frontend with events enabled talks to a backend with events disabled
- **THEN** the subscription fails silently and the app continues with REST-only behavior

### Requirement: Event delivery is best-effort
The system SHALL treat event delivery as best-effort; losing the stream must never break the application.

#### Scenario: Stream unavailable
- **WHEN** the stream cannot be established or drops
- **THEN** the client keeps working and changes become visible after a manual refresh or board switch

#### Scenario: Subscription failure is silent
- **WHEN** subscription fails for any reason
- **THEN** no user-visible error is shown

### Requirement: Stream traffic is exempt from the request rate limit
The event stream SHALL NOT consume the global request rate-limit budget.

#### Scenario: Reconnect after heavy REST use
- **WHEN** a client reconnects to the stream after having performed many REST requests
- **THEN** the connection is still accepted

### Requirement: Stream traffic is excluded from the audit log
The system SHALL NOT store event-stream traffic in the request audit log.

#### Scenario: Stream connection closes
- **WHEN** an event stream connection closes
- **THEN** no audit entry contains the streamed event frames

### Requirement: Idle streams are kept alive
The server SHALL periodically write a heartbeat frame on every open stream.

#### Scenario: Idle board
- **WHEN** no board change occurs for the heartbeat interval
- **THEN** the server writes a comment frame so intermediaries do not close the connection

### Requirement: Revoked access closes open streams
The system SHALL close a user's open streams for a board when that user loses access to the board.

#### Scenario: Member removed
- **WHEN** a user is removed from a board's members
- **THEN** any open stream that user holds for that board is closed
