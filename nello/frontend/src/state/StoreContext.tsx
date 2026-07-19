import { createContext, useContext, type ReactNode } from 'react';
import type { Action, State } from './types';
import { usePersistedReducer } from './usePersistedReducer';

interface StoreValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = usePersistedReducer();

  return (
    <StoreCtx.Provider value={{ state, dispatch }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
