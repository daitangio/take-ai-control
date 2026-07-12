import { useState, useRef, useEffect } from 'react';
import { Card as CardType } from '../types';
import './Card.css';

interface CardProps {
  card: CardType;
  sourceListId: string;
  isDropBefore?: boolean;
  onUpdate: (cardId: string, text: string) => void;
  onDelete: (cardId: string) => void;
}

function Card({ card, sourceListId, isDropBefore, onUpdate, onDelete }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(card.text);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditText(card.text);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editText.trim() && editText.trim() !== card.text) {
      onUpdate(card.id, editText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(card.text);
      setIsEditing(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/trella-card',
      JSON.stringify({ cardId: card.id, sourceListId }),
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`card${isDragging ? ' card-dragging' : ''}${isDropBefore ? ' card-drop-before' : ''}`}
      data-card-id={card.id}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={isEditing ? undefined : handleStartEdit}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="card-edit-input"
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="card-text">{card.text}</span>
      )}
      <button
        className="card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
        title="Delete card"
      >
        ✕
      </button>
    </div>
  );
}

export default Card;
