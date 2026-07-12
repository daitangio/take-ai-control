import { useState, useRef, useEffect } from 'react';
import { BoardData, Card } from '../types';
import List from './List';
import './Board.css';

function Board() {
  const [board, setBoard] = useState<BoardData>({
    lists: [
      {
        id: '1',
        title: 'To Do',
        cards: [
          { id: 'c1', text: 'Welcome to Trella! Drag cards between lists' },
          { id: 'c2', text: 'Click a card to edit it' },
          { id: 'c3', text: 'Click list title to rename' },
        ],
      },
      {
        id: '2',
        title: 'In Progress',
        cards: [
          { id: 'c4', text: 'Try adding a new list' },
          { id: 'c5', text: 'Hover over cards to see the delete button' },
        ],
      },
      {
        id: '3',
        title: 'Done',
        cards: [{ id: 'c6', text: 'Set up Trello-like board' }],
      },
    ],
  });
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const addListInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddList && addListInputRef.current) {
      addListInputRef.current.focus();
    }
  }, [showAddList]);

  const addList = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setBoard((prev) => ({
      lists: [
        ...prev.lists,
        { id: crypto.randomUUID(), title: trimmed, cards: [] },
      ],
    }));
  };

  const updateListTitle = (listId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setBoard((prev) => ({
      lists: prev.lists.map((l) =>
        l.id === listId ? { ...l, title: trimmed } : l,
      ),
    }));
  };

  const deleteList = (listId: string) => {
    setBoard((prev) => ({
      lists: prev.lists.filter((l) => l.id !== listId),
    }));
  };

  const addCard = (listId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBoard((prev) => ({
      lists: prev.lists.map((l) =>
        l.id === listId
          ? { ...l, cards: [...l.cards, { id: crypto.randomUUID(), text: trimmed }] }
          : l,
      ),
    }));
  };

  const updateCardText = (listId: string, cardId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBoard((prev) => ({
      lists: prev.lists.map((l) =>
        l.id === listId
          ? {
              ...l,
              cards: l.cards.map((c) =>
                c.id === cardId ? { ...c, text: trimmed } : c,
              ),
            }
          : l,
      ),
    }));
  };

  const deleteCard = (listId: string, cardId: string) => {
    setBoard((prev) => ({
      lists: prev.lists.map((l) =>
        l.id === listId
          ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) }
          : l,
      ),
    }));
  };

  const moveCard = (
    cardId: string,
    sourceListId: string,
    targetListId: string,
    targetIndex: number,
  ) => {
    setBoard((prev) => {
      // Find and remove the card from the source list
      let draggedCard: Card | null = null;
      let sourceIndex = -1;

      const listsWithoutCard = prev.lists.map((l) => {
        if (l.id !== sourceListId) return l;
        const idx = l.cards.findIndex((c) => c.id === cardId);
        if (idx === -1) return l;
        draggedCard = l.cards[idx];
        sourceIndex = idx;
        return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
      });

      if (!draggedCard) return prev;

      return {
        lists: listsWithoutCard.map((l) => {
          if (l.id !== targetListId) return l;

          // When moving within the same list, removing the card shifts
          // indices after sourceIndex left by one — compensate.
          let insertAt = targetIndex;
          if (sourceListId === targetListId && sourceIndex < targetIndex) {
            insertAt = targetIndex - 1;
          }
          insertAt = Math.max(0, Math.min(insertAt, l.cards.length));

          const cards = [...l.cards];
          cards.splice(insertAt, 0, draggedCard!);
          return { ...l, cards };
        }),
      };
    });
  };

  const handleAddListSubmit = () => {
    addList(newListTitle);
    setNewListTitle('');
    setShowAddList(false);
  };

  const handleAddListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddListSubmit();
    } else if (e.key === 'Escape') {
      setNewListTitle('');
      setShowAddList(false);
    }
  };

  return (
    <div className="board-container">
      <header className="board-header">
        <h1 className="board-title">Trella Board</h1>
      </header>

      <div className="board-lists">
        {board.lists.map((list) => (
          <List
            key={list.id}
            list={list}
            onUpdateTitle={updateListTitle}
            onDelete={deleteList}
            onAddCard={addCard}
            onUpdateCard={updateCardText}
            onDeleteCard={deleteCard}
            onMoveCard={moveCard}
          />
        ))}

        <div className="add-list-column">
          {showAddList ? (
            <div className="add-list-form">
              <input
                ref={addListInputRef}
                className="add-list-input"
                type="text"
                placeholder="Enter list title..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={handleAddListKeyDown}
                onBlur={() => {
                  if (!newListTitle.trim()) {
                    setShowAddList(false);
                  }
                }}
              />
              <div className="add-list-actions">
                <button
                  className="add-list-submit"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddListSubmit();
                  }}
                >
                  Add list
                </button>
                <button
                  className="add-list-cancel"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setNewListTitle('');
                    setShowAddList(false);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              className="add-list-button"
              onClick={() => setShowAddList(true)}
            >
              + Add another list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Board;
