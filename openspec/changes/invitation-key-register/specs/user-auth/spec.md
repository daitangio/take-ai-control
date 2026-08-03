## MODIFIED Requirements

### Requirement: User registration

The system SHALL allow a new user to register with an email, invitation key, and password. The invitation key MUST be validated against the `register_key` table before account creation. The password MUST be hashed with bcrypt before storage and be at least 12 characters long. The email MUST be unique.

#### Scenario: Successful registration

- **WHEN** a user sends `POST /api/auth/register` with a unique email, a valid invitation key, and a password of 12 or more characters
- **THEN** a user account is created and the response includes a JWT access token with status 200

#### Scenario: Duplicate email registration

- **WHEN** a user sends `POST /api/auth/register` with an email that already exists
- **THEN** the system returns status 409 with an error message

#### Scenario: Registration with short password

- **WHEN** a user sends `POST /api/auth/register` with a valid invitation key but a password shorter than 12 characters
- **THEN** the system returns status 422 with a validation error

#### Scenario: Registration with missing invitation key

- **WHEN** a user sends `POST /api/auth/register` without an invitation key
- **THEN** the system returns status 422 with a validation error

#### Scenario: Registration with invalid email

- **WHEN** a user sends `POST /api/auth/register` with a malformed email
- **THEN** the system returns status 422 with a validation error
