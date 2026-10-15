## Purpose

Provide an accessible floating preview for card links while preserving a reliable way to open the resource externally.

## ADDED Requirements

### Requirement: Floating card-link preview

The system SHALL open a floating preview window when a user activates a card link control. The preview SHALL identify the card resource, display the HTTP(S) URL in an embedded browsing surface, and keep the board visible behind it.

#### Scenario: Open a frameable card link

- **WHEN** a user activates the link control for a card whose HTTP(S) resource permits embedding
- **THEN** a floating preview opens and displays that resource without navigating away from the board

#### Scenario: Close a card-link preview

- **WHEN** a user activates the preview close control or presses Escape while the preview is active
- **THEN** the preview closes and focus returns to the card link control

#### Scenario: Replace an open preview

- **WHEN** a user activates a different card link while a preview is already open
- **THEN** the existing preview displays the newly selected resource without opening an additional window

### Requirement: External preview fallback

The floating preview SHALL always provide an accessible action to open its URL in a separate browsing context with `noopener` protection. The system MUST remain usable when a remote site declines iframe embedding.

#### Scenario: Open externally from preview

- **WHEN** a user activates the preview's external-open action
- **THEN** the resource opens in a separate browsing context and the board remains available

#### Scenario: Remote resource blocks embedding

- **WHEN** the remote resource prevents embedding through browser policy
- **THEN** the preview continues to expose the URL and external-open action without breaking board interactions

### Requirement: Preview accessibility and viewport behavior

The floating preview SHALL be keyboard operable, expose an accessible name, constrain its content within the viewport, and not initiate card drag or open the card detail modal.

#### Scenario: Keyboard preview operation

- **WHEN** a keyboard user opens a card-link preview
- **THEN** focus moves into the preview and its close and external-open controls are operable by keyboard

#### Scenario: Narrow viewport

- **WHEN** a preview is opened on a narrow viewport
- **THEN** its controls remain visible and the embedded content fits within the viewport
