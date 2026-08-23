import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../state/StoreContext';
import { CardTile } from './CardTile';
import { useTranslation } from 'react-i18next';
import './ListColumn.css';
import { CapacityWarning } from './CapacityWarning';
import { nanoid } from 'nanoid';

interface Props {
  listId: string;
  boardId: string;
  onCardClick: (cardId: string) => void;
  onCardMembersClick: (cardId: string) => void;
  onCardArchived: (cardId: string) => void;
  onShowArchived?: (listId: string, listName: string) => void;
  searchQuery?: string;
}

export function ListColumn({ listId, boardId, onCardClick, onCardMembersClick, onCardArchived, onShowArchived, searchQuery = '' }: Props) {
  const { state, apiDispatch } = useStore();
  const { t } = useTranslation();
  const list = state.lists[listId];
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [backgroundMenuOpen, setBackgroundMenuOpen] = useState(false);
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
  const board = state.boards[boardId];

  // Filter cards based on search query
  const visibleCardIds = list.cardIds.filter(cardId => {
    if (!searchQuery) return true;
    
    // If the list name itself matches, show all cards
    if (list.name.toLowerCase().includes(searchQuery)) return true;
    
    const card = state.cards[cardId];
    if (!card) return false;
    
    return (
      card.title.toLowerCase().includes(searchQuery) ||
      card.description.toLowerCase().includes(searchQuery) ||
      (card.modifiedBy && card.modifiedBy.toLowerCase().includes(searchQuery))
    );
  });

  const cardCount = visibleCardIds.length;

  const handleRename = () => {
    if (renameName.trim()) {
      apiDispatch({ type: 'list/rename', listId, name: renameName });
    }
    setRenaming(false);
  };

  const handleArchive = () => {
    if (!window.confirm(t('list.archiveConfirm', { name: list.name }))) return;
    setMenuOpen(false);
    apiDispatch({ type: 'list/archive', listId });
  };

  const handleAddCard = (keepComposerOpen = false) => {
    if (cardTitle.trim()) {
      apiDispatch({
        type: 'card/create',
        cardId: nanoid(),
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
    >
      <CapacityWarning resource="cards" capacity={list.cardCapacity} />
      <div className="list-header">
        <button
          type="button"
          className={`list-drag-handle${isDragging ? ' list-drag-handle--dragging' : ''}`}
          aria-label={t('list.dragAria')}
          {...attributes}
          {...listeners}
        >
          <svg
            className="list-drag-handle__grip"
            aria-hidden="true"
            width="10"
            height="14"
            viewBox="0 0 10 14"
            fill="currentColor"
          >
            <circle cx="2" cy="2" r="1.4" />
            <circle cx="2" cy="7" r="1.4" />
            <circle cx="2" cy="12" r="1.4" />
            <circle cx="8" cy="2" r="1.4" />
            <circle cx="8" cy="7" r="1.4" />
            <circle cx="8" cy="12" r="1.4" />
          </svg>
        </button>
        {renaming ? (
          <input
            className="list-name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setRenaming(false);
                setRenameName('');
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="list-name-static"
            onClick={() => {
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
            aria-label={t('list.actionsAria', { name: list.name })}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setMenuOpen(false);
            }}
          >
            ...
          </button>
          {menuOpen && (
            <div
              className="list-menu-popup"
              role="menu"
              aria-label={t('list.actionsMenuAria', { name: list.name })}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setMenuOpen(false);
              }}
            >
              {onShowArchived && (
                <button
                  type="button"
                  role="menuitem"
                  className="list-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onShowArchived(listId, list.name);
                  }}
                >
                  {t('list.showArchived')}
                </button>
              )}
              {board && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className="list-menu-item"
                    aria-expanded={backgroundMenuOpen}
                    onClick={() => setBackgroundMenuOpen((open) => !open)}
                  >
                    {t('board.background')}
                  </button>
                  {backgroundMenuOpen && (
                    <div className="board-background-menu" role="group" aria-label={t('board.background')}>
                      {([
                        [null, 'none'],
                        ['mountain', 'mountain'],
                        ['sea', 'sea'],
                        ['sport', 'sport'],
                      ] as const).map(([background, label]) => (
                        <button
                          key={label}
                          type="button"
                          role="menuitemradio"
                          aria-checked={board.background === background}
                          className={`board-background-option board-background-option--${label}`}
                          onClick={() => {
                            apiDispatch({ type: 'board/background', boardId, background });
                            setBackgroundMenuOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <span className="board-background-preview" aria-hidden="true" />
                          <span>{t(`board.background${label[0].toUpperCase()}${label.slice(1)}`)}</span>
                          {board.background === background && <span aria-hidden="true">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button
                type="button"
                role="menuitem"
                className="list-menu-item"
                onClick={handleArchive}
              >
                {t('list.archive')}
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
          items={visibleCardIds}
          strategy={verticalListSortingStrategy}
        >
          {visibleCardIds.map((cardId) => (
            <CardTile
              key={cardId}
              cardId={cardId}
              listId={listId}
              onClick={() => onCardClick(cardId)}
              onMembersClick={() => onCardMembersClick(cardId)}
              onArchived={() => onCardArchived(cardId)}
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
              placeholder={t('list.enterTitle')}
              autoFocus
            />
            <div className="card-composer-actions">
              <button
                type="button"
                className="card-composer-submit"
                onClick={() => handleAddCard()}
              >
                {t('list.addCard')}
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
            {t('list.addCardButton')}
          </button>
        )}
      </div>
    </div>
  );
}
