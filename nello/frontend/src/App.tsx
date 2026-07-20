import { useEffect } from 'react';
import { StoreProvider, useStore } from './state/StoreContext';
import { useAuth } from './state/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { BoardSwitcher } from './components/BoardSwitcher';
import { EmptyState } from './components/EmptyState';
import { BoardView } from './components/BoardView';
import { HelpBox } from './components/HelpBox';
import './App.css';

function AppInner() {
  const { state, loadBoards, toast, clearToast } = useStore();
  const { token, logout } = useAuth();

  // Load boards when authenticated
  useEffect(() => {
    if (token) {
      loadBoards();
    }
  }, [token, loadBoards]);

  const hasBoards = Object.keys(state.boards).length > 0;
  const hasActiveBoard = state.activeBoardId !== null;

  return (
    <div className="app">
      {toast && (
        <div className="toast-container">
          <div className="toast toast-error">
            {toast}
            <button className="toast-close" onClick={clearToast}>×</button>
          </div>
        </div>
      )}
      <header className="app-header">
        <h1 className="app-title">Nello</h1>
        {token && (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        )}
        {hasBoards && <BoardSwitcher />}
      </header>
      <main className="app-board">
        {!hasBoards ? (
          <EmptyState />
        ) : hasActiveBoard ? (
          <BoardView />
        ) : null}
      </main>
      <HelpBox />
    </div>
  );
}

export default function App() {
  return (
    <AuthGuard>
      <StoreProvider>
        <AppInner />
      </StoreProvider>
    </AuthGuard>
  );
}
