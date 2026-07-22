## Why

Users need a quick way to find specific cards and lists within the application, especially as the number of items grows. Adding a filter functionality to the upper bar allows for fast, real-time discovery of relevant content based on text matching.

## What Changes

- Add a text input field in the upper bar of the frontend application (`nello/frontend`).
- Implement real-time filtering that applies to all cards and lists displayed.
- The filter matches text against:
  - Card title
  - Card description
  - Card `modifiedBy` field
  - List name
- Cards or lists not matching the filter term will be hidden from the view.

## Capabilities

### New Capabilities
- `search-filter`: Real-time text-based filtering of lists and cards based on title, description, modifiedBy, and list name.

### Modified Capabilities
- `<existing-name>`: (Assuming no existing specs are modified; this is a new capability on top of the UI).

## Impact

- Frontend UI: The upper bar (App Bar / Header) will need a new text input component.
- Frontend State/Logic: The state management or component tree will need to hold the active search query and pass it down to list/card rendering components.
- No backend impact is expected unless the data is fetched dynamically based on search, but the description implies client-side filtering of existing loaded lists and cards.