## 1. Editor Metadata API

- [x] 1.1 Add editor email and requester-relative editor metadata to card response models and card/board-detail service queries.
- [x] 1.2 Propagate the metadata through card create, edit, move, and board-detail API responses.
- [x] 1.3 Add backend tests for own-editor, other-editor, and legacy-card response metadata.

## 2. Card Indicator UI

- [x] 2.1 Extend frontend API types, state types, reducer actions, and board loading to retain editor metadata.
- [x] 2.2 Render and style an accessible editor icon to the right of other-user card titles without affecting tile interactions.
- [x] 2.3 Add frontend tests for indicator visibility, tooltip email, and absence for own or legacy cards.

## 3. Verification

- [x] 3.1 Run backend and frontend tests, frontend production build, and lint; resolve regressions.
