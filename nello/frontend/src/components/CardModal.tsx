import { useEffect, useState, useRef } from 'react';
import { useStore } from '../state/StoreContext';
import type { Card } from '../state/types';

interface Props {
  cardId: string;
  onClose: () => void;
}

export function CardModal({ cardId, onClose }: Props) {
  const { state, apiDispatch } = useStore();
  const card: Card | undefined = state.cards[cardId];
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [dueDate, setDueDate] = useState(card?.dueDate ?? '');

  // Synchronize local state if the card updates from the server
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setDueDate(card.dueDate ?? '');
    }
  }, [card]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!card) onClose();
  }, [card, onClose]);

  const save = () => {
    if (title.trim() && card) {
      // GG: if card is not dirty DO NOT Send an edit
      if (title === card.title && description === card.description && dueDate === (card.dueDate ?? '')) return;
      apiDispatch({
        type: 'card/edit',
        cardId: card.id,
        title,
        description,
        dueDate: dueDate || null,
      });
    }
  };

  const handleDelete = () => {
    if (!card) return;
    if (window.confirm(`Delete card "${card.title}"?`)) {
      apiDispatch({ type: 'card/delete', cardId: card.id });
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      save();
      onClose();
    }
  };

  if (!card) return null;

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal">
        <input
          className="modal-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="Card title"
        />
        <div>
          <label className="modal-label">Description</label>
          <textarea
            className="modal-desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={save}
            placeholder="Add a description..."
          />
        </div>
        <div>
          <label className="modal-label" htmlFor="card-due-date-input">Due date</label>
          <input
            id="card-due-date-input"
            type="date"
            className="modal-date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={save}
          />
        </div>
        {card.modifiedBy && (
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>
            Last modified by: {card.modifiedByEmail || card.modifiedBy}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="modal-delete-btn"
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => {
              save();
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
