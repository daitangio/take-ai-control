## ADDED Requirements

### Requirement: List tests cover list lifecycle and ordering contracts
The suite SHALL cover list lifecycle and ordering contracts: create (incl. other-user-board `404` and unauthenticated `401`), rename, rename other-user `404`, delete cascade-to-cards, archive (deletes the list and its cards, other-user `404`), reorder, and reorder ignoring archived lists. Archive tests SHALL assert via raw SQL that the `list` and `card` rows are deleted and no `card_archive` rows remain.

#### Scenario: Delete list cascades to its cards
- **WHEN** a list containing a card is deleted
- **THEN** the response is `204` and fetching the board shows zero lists

#### Scenario: Archive list removes it and deletes its cards
- **WHEN** a list with a card is archived
- **THEN** the response is `204`, the board no longer includes the list, and raw SQL shows the `list` row and its `card` rows are deleted

## REMOVED Requirements

### Requirement: List tests reproduce Python test_lists behavior
