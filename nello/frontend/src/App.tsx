import { StoreProvider, useStore } from './state/StoreContext';
import { BoardSwitcher } from './components/BoardSwitcher';
import { EmptyState } from './components/EmptyState';
import { BoardView } from './components/BoardView';
import './App.css';

function AppInner() {
  const { state } = useStore();
  const hasBoards = Object.keys(state.boards).length > 0;
  const hasActiveBoard = state.activeBoardId !== null;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Nello</h1>
        {hasBoards && <BoardSwitcher />}
      </header>
      <main className="app-board">
        {!hasBoards ? (
          <EmptyState />
        ) : hasActiveBoard ? (
          <BoardView />
        ) : null}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
