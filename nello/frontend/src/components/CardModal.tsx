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
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!card) onClose();
  }, [card, onClose]);

  const save = () => {
    if (title.trim() && card) {
      apiDispatch({
        type: 'card/edit',
        cardId: card.id,
        title,
        description,
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
              save();
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
