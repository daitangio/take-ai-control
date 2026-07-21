import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../state/StoreContext';
import { CardTile } from './CardTile';
import './ListColumn.css';

interface Props {
  listId: string;
  boardId: string;
  onCardClick: (cardId: string) => void;
}

export function ListColumn({ listId, boardId, onCardClick }: Props) {
  const { state, apiDispatch } = useStore();
  const list = state.lists[listId];
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Sortable for list reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: listId,
    data: { type: 'list', boardId },
  });

  // Droppable for card drops
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `list-zone-${listId}`,
    data: { type: 'list', listId },
  });

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  if (!list) return null;

  const cardCount = list.cardIds.length;

  const handleRename = () => {
    if (renameName.trim()) {
      apiDispatch({ type: 'list/rename', listId, name: renameName });
    }
    setRenaming(false);
  };

  const handleArchive = () => {
    setMenuOpen(false);
    apiDispatch({ type: 'list/archive', listId });
  };

  const handleAddCard = (keepComposerOpen = false) => {
    if (cardTitle.trim()) {
      apiDispatch({
        type: 'card/create',
        cardId: crypto.randomUUID(),
        listId,
        title: cardTitle,
      });
      setCardTitle('');
      if (!keepComposerOpen) setAddingCard(false);
    }
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setSortableRef}
      className="list-column"
      style={style}
      {...attributes}
    >
      <div className="list-header" {...listeners}>
        {renaming ? (
          <input
            className="list-name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setRenaming(false);
                setRenameName('');
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className="list-name-static"
            onClick={(e) => {
              e.stopPropagation();
              setRenameName(list.name);
              setRenaming(true);
            }}
          >
            {list.name}
          </span>
        )}
        <span className="list-size-jj">{list.cardIds.length}</span>
        <div className="list-menu" ref={menuRef}>
          <button
            type="button"
            className="list-menu-btn"
            aria-label={`List actions for ${list.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') setMenuOpen(false);
            }}
          >
            ...
          </button>
          {menuOpen && (
            <div
              className="list-menu-popup"
              role="menu"
              aria-label={`Actions for ${list.name}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') setMenuOpen(false);
              }}
            >
              <button
                type="button"
                role="menuitem"
                className="list-menu-item"
                onClick={handleArchive}
              >
                Archive
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={setDroppableRef}
        className={`card-list${isOver ? ' card-list--over' : ''}${cardCount === 0 ? ' card-list--empty' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget && !addingCard) {
            setAddingCard(true);
          }
        }}
      >
        <SortableContext
          items={list.cardIds}
          strategy={verticalListSortingStrategy}
        >
          {list.cardIds.map((cardId) => (
            <CardTile
              key={cardId}
              cardId={cardId}
              listId={listId}
              onClick={() => onCardClick(cardId)}
            />
          ))}
        </SortableContext>
      </div>

      <div className="card-composer">
        {addingCard ? (
          <div className="card-composer-form">
            <textarea
              className="card-composer-input"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(true);
                }
                if (e.key === 'Escape') {
                  setAddingCard(false);
                  setCardTitle('');
                }
              }}
              placeholder="Enter card title..."
              autoFocus
            />
            <div className="card-composer-actions">
              <button
                type="button"
                className="card-composer-submit"
                onClick={() => handleAddCard()}
              >
                Add Card
              </button>
              <button
                type="button"
                className="card-composer-cancel"
                onClick={() => {
                  setAddingCard(false);
                  setCardTitle('');
                }}
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="card-composer-btn"
            onClick={() => setAddingCard(true)}
          >
            + Add Card
          </button>
        )}
      </div>
    </div>
  );
}
