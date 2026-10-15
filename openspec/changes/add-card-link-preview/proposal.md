## Why

Opening a card resource currently takes the user away from Nello. A floating preview lets users consult a linked resource while keeping the board and its context visible.

## What Changes

- Add an in-app floating link-preview window opened from a card's external-link control.
- Render the card's HTTP(S) URL in a sandboxed iframe when the remote site permits embedding.
- Provide a persistent external-open action and a clear unavailable state for sites that block iframe embedding.
- Add keyboard-accessible close behavior and responsive sizing without changing card data or API contracts.

## Capabilities

### New Capabilities

- `card-link-preview`: Floating, accessible in-app previews for frameable card links, including external fallback behavior.

### Modified Capabilities

- None.

## Impact

- Frontend card-tile interaction, a new preview component and styling, translations, and component tests.
- No backend, database, or API changes. Remote-site embedding policies (`X-Frame-Options` / CSP) determine whether a given URL can render in the iframe.
