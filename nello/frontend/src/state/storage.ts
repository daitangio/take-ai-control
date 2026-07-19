import type { State } from './types';

const STORAGE_KEY = 'nello:v1';
const CURRENT_VERSION = 1;

interface VersionedPayload {
  version: number;
  state: State;
}

/** Abstraction over persistence so we can swap backends later. */
export interface Storage {
  load(): State | null;
  save(state: State): void;
}

/** localStorage adapter with versioned payload. */
export const localStorageAdapter: Storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      // Schema validation
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        parsed.version !== CURRENT_VERSION ||
        !parsed.state ||
        typeof parsed.state !== 'object' ||
        !parsed.state.boards ||
        !parsed.state.lists ||
        !parsed.state.cards ||
        !('activeBoardId' in parsed.state)
      ) {
        return null;
      }

      return parsed.state as State;
    } catch {
      return null;
    }
  },

  save(state: State) {
    const payload: VersionedPayload = { version: CURRENT_VERSION, state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },
};
