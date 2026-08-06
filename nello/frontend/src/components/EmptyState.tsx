import { useState } from 'react';
import { useLingui } from '@lingui/macro';
import { useStore } from '../state/StoreContext';
import './Board.css';

export function EmptyState() {
  const { t } = useLingui();
  const { apiDispatch } = useStore();
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      apiDispatch({
        type: 'board/create',
        boardId: crypto.randomUUID(),
        name,
      });
      setName('');
    }
  };

  return (
    <div className="empty-state">
      <p className="empty-state-text">{t`No boards yet. Create your first board to get started.`}</p>
      <span className="empty-state-form">
        <input
          className="empty-state-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
          }}
          placeholder={t`Board name`}
          autoFocus
        />
        <button
          type="button"
          className="empty-state-btn"
          onClick={handleCreate}
        >
          {t`Create Board`}
        </button>
      </span>
    </div>
  );
}
