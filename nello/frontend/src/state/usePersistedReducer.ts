import { useEffect, useReducer, useRef } from 'react';
import type { Action, State } from './types';
import { createInitialState } from './types';
import { reducer } from './reducer';
import type { Storage } from './storage';
import { localStorageAdapter } from './storage';

const DEBOUNCE_MS = 200;

/**
 * Like useReducer but loads initial state from storage and
 * debounce-persists every commit.
 */
export function usePersistedReducer(
  storage: Storage = localStorageAdapter,
): [State, React.Dispatch<Action>] {
  const initial = useRef<State | null>(null);
  if (initial.current === null) {
    const loaded = storage.load();
    initial.current = loaded ?? createInitialState();
  }

  const [state, dispatch] = useReducer(reducer, initial.current);

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      storage.save(state);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [state, storage]);

  return [state, dispatch];
}
