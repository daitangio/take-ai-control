import { useState } from 'react';
import { useStore } from '../state/StoreContext';
import { MemberDialog } from './MemberDialog';
import './Board.css';

export function BoardSwitcher() {
  const { state, dispatch, apiDispatch } = useStore();
  const boards = Object.values(state.boards);
  const activeId = state.activeBoardId;

  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [sharingBoardId, setSharingBoardId] = useState<string | null>(null);

  const handleCreate = () => {
    if (createName.trim()) {
      apiDispatch({
        type: 'board/create',
        boardId: crypto.randomUUID(),
        name: createName,
      });
      setCreateName('');
      setCreating(false);
    }
  };

  const handleRename = (boardId: string) => {
    if (editName.trim()) {
      apiDispatch({ type: 'board/rename', boardId, name: editName });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (boardId: string, name: string) => {
    if (window.confirm(`Delete board "${name}" and all its contents?`)) {
      apiDispatch({ type: 'board/delete', boardId });
    }
  };

  const startEditing = (boardId: string, name: string) => {
    setEditingId(boardId);
    setEditName(name);
  };

  return (
    <div className="board-tabs">
      {boards.map((board) => (
        <div
          key={board.id}
          className={`board-tab ${board.id === activeId ? 'board-tab--active' : ''} ${editingId === board.id ? 'board-tab--editing' : ''}`}
        >
          {editingId === board.id ? (
            <input
              className="board-tab-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRename(board.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(board.id);
                if (e.key === 'Escape') {
                  setEditingId(null);
                  setEditName('');
                }
              }}
              autoFocus
            />
          ) : (
            <>
              <button
                type="button"
                className="board-tab-name"
                onClick={() =>
                  dispatch({ type: 'board/switch', boardId: board.id })
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {board.name}
              </button>
              {board.isOwner !== false && (
                <button
                  type="button"
                  className="board-tab-delete"
                  title="Delete board"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(board.id, board.name);
                  }}
                >
                  ×
                </button>
              )}
              <button
                type="button"
                className="board-tab-delete"
                title="Rename board"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(board.id, board.name);
                }}
                style={{ fontSize: '12px' }}
              >
                ✎
              </button>
              {board.isShared && board.isOwner && (
                <button
                  type="button"
                  className="board-tab-delete"
                  title="Manage members"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSharingBoardId(board.id);
                  }}
                >
                  👤
                </button>
              )}
            </>
          )}
        </div>
      ))}

      <div className="board-create">
        {creating ? (
          <span className="board-create-form">
            <input
              className="board-create-input"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setCreating(false);
                  setCreateName('');
                }
              }}
              placeholder="Board name"
              autoFocus
            />
            <button
              type="button"
              className="board-create-submit"
              onClick={handleCreate}
            >
              Add
            </button>
            <button
              type="button"
              className="board-create-cancel"
              onClick={() => {
                setCreating(false);
                setCreateName('');
              }}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="board-create-btn"
            onClick={() => setCreating(true)}
          >
            + New Board
          </button>
        )}
      </div>

      {sharingBoardId && (
        <MemberDialog
          boardId={sharingBoardId}
          onClose={() => setSharingBoardId(null)}
        />
      )}
    </div>
  );
}
