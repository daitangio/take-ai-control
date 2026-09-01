## MODIFIED Requirements

### Requirement: Capacity limit enforcement

The system SHALL prevent creation or restoration of a board, active list, or active card when doing so would exceed the applicable tier limit. A rejected operation MUST leave existing data unchanged and return a stable, localizable capacity-limit error. Board limits apply to boards owned by the user; list and card limits apply to active entities and use the owning board user's tier.

#### Scenario: Board limit is reached

- **WHEN** a user attempts to create a board after reaching their board limit
- **THEN** no board is created and the system returns a capacity-limit error to the user

#### Scenario: List limit is reached

- **WHEN** a user attempts to create an active list in a board that has reached its active-list limit
- **THEN** no list is created and the system returns a capacity-limit error to the user

#### Scenario: Card limit is reached

- **WHEN** a user attempts to create, restore, or move a card into a list that has reached its active-card limit
- **THEN** the operation is rejected, the card remains in its prior state, and the system returns a capacity-limit error to the user

#### Scenario: Archival releases active capacity

- **WHEN** a list or card is archived
- **THEN** it no longer counts toward its applicable active-entity limit

### Requirement: Capacity threshold warning

The system SHALL show a non-blocking, localized warning when an authenticated user reaches or exceeds 75% of the applicable board, list, or card capacity. The warning MUST identify the affected resource and its current usage versus limit, and MUST NOT prevent an otherwise permitted operation.

#### Scenario: Board capacity warning

- **WHEN** a user owns boards at or above 75% of their board limit
- **THEN** the user is shown a non-blocking board-capacity warning with the current board count and limit

#### Scenario: List capacity warning

- **WHEN** an accessible board has active lists at or above 75% of its owner's per-board list limit
- **THEN** the user is shown a non-blocking list-capacity warning with the current list count and limit

#### Scenario: Card capacity warning

- **WHEN** an accessible list has active cards at or above 75% of its board owner's per-list card limit
- **THEN** the user is shown a non-blocking card-capacity warning with the current card count and limit

#### Scenario: Below-threshold capacity has no warning

- **WHEN** the applicable resource usage is below 75% of its limit
- **THEN** no capacity warning is shown for that resource
