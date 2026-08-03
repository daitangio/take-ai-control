## 1. Collision Targeting

- [x] 1.1 Add a drag-type-aware board collision strategy that restricts list drags to sortable lists on the active board.
- [x] 1.2 Resolve nested collision metadata to the owning list before calculating the reordered list index.
- [x] 1.3 Preserve all existing card drag targets and behavior.

## 2. Verification

- [x] 2.1 Add unit tests for list collision filtering and unchanged card collision handling.
- [x] 2.2 Run the complete frontend test suite, lint, and production build.
- [ ] 2.3 In Safari, manually move the last visible list left and right using its drag handle and confirm the order persists.
