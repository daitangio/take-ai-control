import { useState, useRef, useEffect } from 'react';
import { List as ListType } from '../types';
import Card from './Card';
import './List.css';

interface ListProps {
  list: ListType;
  onUpdateTitle: (listId: string, title: string) => void;
  onDelete: (listId: string) => void;
  onAddCard: (listId: string, text: string) => void;
  onUpdateCard: (listId: string, cardId: string, text: string) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  onMoveCard: (
    cardId: string,
    sourceListId: string,
    targetListId: string,
    targetIndex: number,
  ) => void;
}

function List({
  list,
  onUpdateTitle,
  onDelete,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
}: ListProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardText, setNewCardText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (showAddCard && cardInputRef.current) {
      cardInputRef.current.focus();
    }
  }, [showAddCard]);

  const handleStartEditTitle = () => {
    setTitleDraft(list.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (titleDraft.trim() && titleDraft.trim() !== list.title) {
      onUpdateTitle(list.id, titleDraft);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitleDraft(list.title);
      setIsEditingTitle(false);
    }
  };

  const handleAddCardSubmit = () => {
    if (newCardText.trim()) {
      onAddCard(list.id, newCardText);
      setNewCardText('');
      setShowAddCard(false);
    }
  };

  const handleAddCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCardSubmit();
    } else if (e.key === 'Escape') {
      setNewCardText('');
      setShowAddCard(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);

    // Calculate insertion index from cursor position vs card elements
    const container = cardsContainerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>('[data-card-id]');
    if (cards.length === 0) {
      setDropIndex(0);
      return;
    }

    const mouseY = e.clientY;
    let insertAt = cards.length; // default: end of list

    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (mouseY < midY) {
        insertAt = i;
        break;
      }
    }

    setDropIndex(insertAt);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear when leaving the list container itself, not its children
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
    setDropIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDropIndex(null);
    const payload = e.dataTransfer.getData('application/trella-card');
    if (!payload) return;
    try {
      const { cardId, sourceListId } = JSON.parse(payload);
      onMoveCard(cardId, sourceListId, list.id, dropIndex ?? list.cards.length);
    } catch {
      // Ignore malformed drag data
    }
  };

  return (
    <div className="list">
      <div className="list-header">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            className="list-title-input"
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleSaveTitle}
          />
        ) : (
          <span className="list-title" onClick={handleStartEditTitle}>
            {list.title}
          </span>
        )}
        <button
          className="list-delete"
          onClick={() => onDelete(list.id)}
          title="Delete list"
        >
          ✕
        </button>
      </div>

      <div
          ref={cardsContainerRef}
          className={`list-cards${isDragOver ? ' list-cards-drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
        {list.cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            sourceListId={list.id}
            isDropBefore={dropIndex === index}
            onUpdate={(cardId, text) => onUpdateCard(list.id, cardId, text)}
            onDelete={(cardId) => onDeleteCard(list.id, cardId)}
          />
        ))}
      </div>

      <div className="list-footer">
        {showAddCard ? (
          <div className="add-card-form">
            <input
              ref={cardInputRef}
              className="add-card-input"
              type="text"
              placeholder="Enter a title for this card..."
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
              onKeyDown={handleAddCardKeyDown}
              onBlur={() => {
                if (!newCardText.trim()) {
                  setShowAddCard(false);
                }
              }}
            />
            <div className="add-card-actions">
              <button
                className="add-card-submit"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAddCardSubmit();
                }}
              >
                Add card
              </button>
              <button
                className="add-card-cancel"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setNewCardText('');
                  setShowAddCard(false);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            className="add-card-button"
            onClick={() => setShowAddCard(true)}
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}

export default List;
