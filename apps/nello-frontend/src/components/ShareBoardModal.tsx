import { useState } from "react";
import { addBoardMember } from "../api/boards";

interface ShareBoardModalProps {
  boardId: string;
  onClose: () => void;
}

export function ShareBoardModal({ boardId, onClose }: ShareBoardModalProps) {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      await addBoardMember(boardId, email);
      setFeedback(`Invited ${email}`);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Share board</h2>
          <button type="button" className="ghost-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="stack" onSubmit={handleInvite}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
            />
          </label>
          {feedback ? <p className="success-text">{feedback}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          <div className="modal-actions">
            <button type="submit" className="primary-button" disabled={saving || !email.trim()}>
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
