## ADDED Requirements

### Requirement: User tier persistence

The system SHALL persist a user's assigned tier and each tier's board, per-board list, and per-list card limits. Every user MUST have a tier; newly created users MUST receive the default free tier.

#### Scenario: New user receives the default tier

- **WHEN** a user account is created without an explicitly assigned tier
- **THEN** the account is associated with the free tier

#### Scenario: Tier limits are available with the owner

- **WHEN** the system evaluates capacity for a board, list, or card
- **THEN** it can retrieve the owning user's tier limits with the corresponding ownership data
