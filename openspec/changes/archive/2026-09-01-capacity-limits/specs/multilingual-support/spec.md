## ADDED Requirements

### Requirement: Localized capacity feedback

The frontend SHALL localize capacity-threshold warnings and board, list, and card capacity-limit errors in every supported locale.

#### Scenario: Capacity warning is localized

- **WHEN** a user's capacity reaches the warning threshold while a non-default locale is active
- **THEN** the capacity warning is rendered in that locale with the current usage and limit

#### Scenario: Capacity error is localized

- **WHEN** the API returns a recognized capacity-limit error code while a non-default locale is active
- **THEN** the frontend renders the corresponding localized capacity-limit message
