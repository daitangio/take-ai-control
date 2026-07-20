## 1. Fast Card Entry

- [x] 1.1 Open and autofocus the card composer when unused list-body space is clicked, without intercepting card, header, or composer-control interactions.
- [x] 1.2 Keep the focused composer open after an Enter-created non-empty card while preserving Shift+Enter, Escape, and explicit Add Card behavior.
- [x] 1.3 Give empty list bodies a practical click target while preserving list layout and drag/drop behavior.

## 2. Verification

- [x] 2.1 Add UI tests for list-body activation, consecutive Enter card creation, multiline entry, empty titles, and existing card/list-title click behavior.
- [x] 2.2 Run the frontend test suite and production build, then resolve any regressions.
