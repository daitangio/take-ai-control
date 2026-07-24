# Card Assignment — Spec

## Purpose
TBD. Describe card assignment functionality.

## Requirements

### Requirement: Multiple card members
The system SHALL allow each card to have zero or more assigned members. Assigned members MUST be users who already have access to the card's parent board as the board owner or as board members.

#### Scenario: Assign multiple members to a card
- **WHEN** the user assigns two eligible board users to a card
- **THEN** both users are stored as assigned members for that card

#### Scenario: Reject non-board user assignment
- **WHEN** the user attempts to assign a user who does not have access to the card's parent board
- **THEN** the assignment is rejected and the card's assigned members remain unchanged

#### Scenario: Card can have no members
- **WHEN** all assigned members are removed from a card
- **THEN** the card remains visible and has an empty assigned member list

### Requirement: Card member popup
The system SHALL provide a card-scoped member popup from the card action menu. The popup SHALL show eligible board users and allow assigned members to be added or removed without leaving the board.

#### Scenario: Open card member popup
- **WHEN** the user selects Members from a card action menu
- **THEN** a popup opens for that card showing eligible board users and current assignment state

#### Scenario: Add member from popup
- **WHEN** the user adds an eligible user from the card member popup
- **THEN** the user appears as assigned to the card

#### Scenario: Remove member from popup
- **WHEN** the user removes an assigned member from the card member popup
- **THEN** that user no longer appears as assigned to the card

### Requirement: Assigned member visibility
The system SHALL include assigned member summaries in board detail data so cards can show who is assigned without issuing one request per card.

#### Scenario: Board detail includes assigned members
- **WHEN** the board detail response contains a card with assigned members
- **THEN** the frontend stores those members on the card and can render their email or compact identity summary

#### Scenario: Existing cards have no assigned members
- **WHEN** a card was created before card assignment support
- **THEN** it loads with an empty assigned member list
