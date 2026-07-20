## Context

The authenticated React application is rendered by `AppInner` inside `AuthGuard`; unauthenticated users receive `LoginForm` instead. Board content scrolls horizontally inside `.app-board`, so contextual help placed in that content would move with the board and could be missed. Shared boards already exist, but their trailing `$` convention and owner-only member controls are not explained in the interface.

The help content is expected to grow after this first change. The implementation should therefore keep the content easy to edit without introducing a content-management system or backend dependency.

## Goals / Non-Goals

**Goals:**

- Show lightweight help only in the authenticated application.
- Keep the help visible in the lower-right viewport corner independently of board scrolling.
- Explain how to create a shared board and manage members.
- Let users dismiss the help and avoid showing the same content repeatedly.
- Make later help-copy additions small and localized.
- Provide an accessible and responsive presentation.

**Non-Goals:**

- Interactive onboarding, guided tours, or element highlighting.
- Server-side preference synchronization between browsers.
- User-authored or remotely managed help content.
- Changes to shared-board behavior.

## Decisions

### 1. Dedicated presentational component in the authenticated shell

Add a `HelpBox` component and render it from `AppInner`. `AuthGuard` already prevents `AppInner` from rendering without a token, so this placement guarantees that the login form never contains the help box. The component uses a semantic complementary region with a labelled heading and an accessible close button.

Placing the markup directly in `App.tsx` was considered, but a component keeps state, content, and tests isolated while leaving the application shell compact.

### 2. Fixed lower-right positioning

Use `position: fixed` with bottom and right insets and a stacking level below modal overlays but above board content. This anchors the help to the viewport rather than `.app-board`, whose horizontal overflow would otherwise move or clip it.

At narrow viewport widths, apply matching left and right insets and remove the desktop fixed width so the box fits the screen. The compact card remains an overlay; it does not reflow the board layout.

### 3. Local, declarative help entries

Keep the initial help entries in a small array near the component and render them as a list. Initial copy will cover:

- Creating a shared board by ending its name with `$`, including that the suffix cannot later be removed.
- Using the member button on an owned shared board to invite or remove members.

This avoids premature data modelling while giving later copy a single obvious edit point.

### 4. Versioned browser-local dismissal

Store the current help-content version under a namespaced local-storage key. The box is hidden when the stored version matches the component's current version. Incrementing that version when materially new help is added makes the revised box visible once again.

A session-only dismissal would repeat on every login. A permanent boolean would prevent users who dismissed the first version from seeing later information. Versioned local persistence handles both cases with minimal state.

If local storage is unavailable, dismissal still hides the box for the current component lifetime; persistence failure does not prevent use of the application.

## Risks / Trade-offs

- [The fixed card can cover board content on small screens] → Constrain its dimensions, use safe viewport insets, and keep the initial copy concise.
- [New copy can cause a previously dismissed box to reappear] → Increment the content version only for material additions, not wording-only edits.
- [Browser-local dismissal does not follow the user to another device] → Accept this for a frontend-only hint; account-level preference storage is outside scope.
- [The `$` convention is unusual] → State both its purpose and permanence explicitly rather than relying on the symbol alone.
