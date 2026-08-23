import { useState } from 'react';
import { useStore } from '../state/StoreContext';
import './Board.css';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';

export function EmptyState() {
  const { apiDispatch } = useStore();
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      apiDispatch({
        type: 'board/create',
        boardId: nanoid(),
        name,
      });
      setName('');
    }
  };

  return (
    <div className="empty-state">
      <p className="empty-state-text">{t('emptyState.message')}</p>
      <span className="empty-state-form">
        <input
          className="empty-state-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
          }}
          placeholder={t('emptyState.boardNamePlaceholder')}
          autoFocus
        />
        <button
          type="button"
          className="empty-state-btn"
          onClick={handleCreate}
        >
          {t('emptyState.createBoard')}
        </button>
      </span>
    </div>
  );
}
