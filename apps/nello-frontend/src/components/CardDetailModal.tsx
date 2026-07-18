import { useState } from "react";
import { deleteCard, updateCard } from "../api/cards";
import type { Card } from "../types";

interface CardDetailModalProps {
  card: Card;
  listId: string;
  boardId: string;
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: (cardId: string) => void;
}

export function CardDetailModal({
  card,
  listId,
  boardId,
  onClose,
  onUpdate,
  onDelete
}: CardDetailModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [dueDate, setDueDate] = useState(card.dueDate ?? "");
  const [assigneeEmail, setAssigneeEmail] = useState(card.assignee?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateCard(boardId, listId, card.id, {
        title,
        description: description || null,
        dueDate: dueDate || null,
        assigneeEmail: assigneeEmail || null
      });
      onUpdate(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save card");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError(null);
    try {
      await deleteCard(boardId, listId, card.id);
      onDelete(card.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete card");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Card details</h2>
          <button type="button" className="ghost-button" onClick={onClose}>
            ×
          </button>
        </div>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea rows={5} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <div className="grid-two">
          <label className="field">
            <span>Due date</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <label className="field">
            <span>Assignee email</span>
            <input
              type="email"
              value={assigneeEmail}
              onChange={(event) => setAssigneeEmail(event.target.value)}
            />
          </label>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="modal-actions">
          <button type="button" className="danger-button" onClick={handleDelete} disabled={saving}>
            Delete
          </button>
          <button type="button" className="primary-button" onClick={handleSave} disabled={saving || !title.trim()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
