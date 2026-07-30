import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './state/StoreContext';
import { useAuth } from './state/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { BoardSwitcher } from './components/BoardSwitcher';
import { EmptyState } from './components/EmptyState';
import { BoardView } from './components/BoardView';
import { HelpBox } from './components/HelpBox';
import { UserMenu } from './components/UserMenu';
import { UserSettings } from './components/UserSettings';
import './App.css';

function AppInner() {
  const { state, loadBoards, toast, clearToast, searchQuery, setSearchQuery } = useStore();
  const { token } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

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
        <h1 className="app-title" onClick={() => setShowSettings(false)} style={{ cursor: 'pointer' }}>Nello</h1>
        {!showSettings && hasBoards && <BoardSwitcher />}
        <div className="header-right">
          {!showSettings && (
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          {token && <UserMenu onSettingsClick={() => setShowSettings(true)} />}
        </div>
      </header>
      <main className="app-board">
        {showSettings ? (
          <UserSettings onBack={() => setShowSettings(false)} />
        ) : !hasBoards ? (
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
