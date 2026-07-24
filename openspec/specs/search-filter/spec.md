# Capability: Search Filter

## Purpose
TBD: Allow filtering of lists and cards based on search query.

## Requirements

### Requirement: Search filter input
The system SHALL provide a text input field in the upper application bar for filtering content.

#### Scenario: User types in filter
- **WHEN** user types "alfa" in the search input
- **THEN** the system updates the current search query state to "alfa"

### Requirement: Filter lists and cards
The system SHALL filter the currently displayed lists and cards based on the active search query. The match SHALL be case-insensitive.

#### Scenario: Card content matches
- **WHEN** a card's title, description, or modifiedBy contains the search query
- **THEN** the card remains visible in the list

#### Scenario: Card content does not match
- **WHEN** a card's title, description, and modifiedBy do not contain the search query
- **THEN** the card is hidden

#### Scenario: List name matches
- **WHEN** a list's name contains the search query
- **THEN** the list remains visible, displaying any cards that also match the query

#### Scenario: List contains matching card
- **WHEN** a list's name does not contain the search query, but at least one of its cards matches
- **THEN** the list remains visible, displaying only the matching cards

#### Scenario: List does not match and has no matching cards
- **WHEN** a list's name does not contain the search query and none of its cards match
- **THEN** the list is hidden from the board view