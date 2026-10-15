## Context

Card tiles currently expose stored HTTP(S) links as a protected new-tab anchor. See proposal.md for motivation. Browser CSP and `X-Frame-Options` are enforced by remote sites, so Nello cannot reliably determine or override whether a URL can be framed.

## Goals / Non-Goals

**Goals:**

- Keep board context available while a frameable resource is consulted.
- Give every preview a dependable external-open path.
- Preserve existing card-modal and drag interactions.

**Non-Goals:**

- Proxying remote resources, bypassing frame restrictions, retaining browsing history, or adding per-card preview settings.
- Guaranteeing that every linked site renders in an iframe.

## Decisions

### Use one application-level preview window

A single preview state held near the board view owns the selected URL and source card. Opening another link replaces its contents. This prevents overlapping dialogs and gives Escape/focus restoration one predictable owner. Per-tile preview state was rejected because it allows multiple competing windows and complicates cleanup on board reload.

### Use a sandboxed iframe with a visible external-open action

The preview loads only the URL already validated by the card API. The iframe uses a conservative sandbox appropriate for ordinary browsing, while the external action keeps `target="_blank"` and `rel="noopener noreferrer"`. A server-side fetch or proxy was rejected: it would introduce SSRF, authentication, privacy, and content-rewriting responsibilities.

### Treat blocked embedding as a browser-controlled limitation

The UI cannot reliably receive a cross-origin framing failure signal. It will keep a URL display, close control, and external-open action available even when the iframe shows a browser error or blank content. Attempting client-side frame-policy detection was rejected because it is incomplete and cannot bypass the policy.

### Implement as an accessible dialog with responsive bounds

Use modal-dialog semantics, initial focus on the window controls, Escape close, and focus restoration to the activating link control. The window is centered with viewport-relative maximum width and height; small viewports use near-fullscreen bounds. A draggable desktop window is deferred because it adds pointer/keyboard complexity without improving resource availability.

## Risks / Trade-offs

- [Remote sites deny framing] → Keep external-open available and make the limitation non-fatal.
- [Embedded third-party content is untrusted] → Use a sandbox and do not grant unnecessary iframe permissions.
- [Dialog interferes with board controls] → Trap focus while open and restore it on close.
- [Large pages or mobile keyboards reduce space] → Use responsive max dimensions and independently scrollable preview content.

## Migration Plan

1. Deploy frontend-only preview support; existing card links continue to work.
2. Verify a frameable resource, a frame-blocked resource, keyboard closing, and phone viewport behavior.
3. Roll back by restoring the existing direct external link behavior; no stored data changes.
