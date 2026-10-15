import { useEffect, useState, useRef } from 'react';
import { useStore } from '../state/StoreContext';
import type { Card } from '../state/types';
import { useTranslation } from 'react-i18next';

const COLOR_MAP: Record<string, string> = {
  red: '#fecaca',
  orange: '#fed7aa',
  green: '#bbf7d0',
  blue: '#bfdbfe',
  violet: '#ddd6fe',
  gray: '#e5e7eb',
};

interface Props {
  cardId: string;
  onClose: () => void;
}

export function CardModal({ cardId, onClose }: Props) {
  const { state, apiDispatch } = useStore();
  const { t } = useTranslation();
  const card: Card | undefined = state.cards[cardId];
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [dueDate, setDueDate] = useState(card?.dueDate ?? '');
  const [link, setLink] = useState(card?.link ?? '');
  const [linkAutofilled, setLinkAutofilled] = useState(false);

  // Synchronize local state if the card updates from the server
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setDueDate(card.dueDate ?? '');
      setLink(card.link ?? '');
      setLinkAutofilled(false);
    }
  }, [card]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!card) onClose();
  }, [card, onClose]);

  const save = () => {
    if (title.trim() && card) {
      // GG: if card is not dirty DO NOT Send an edit
      if (title === card.title && description === card.description && dueDate === (card.dueDate ?? '') && link === (card.link ?? '')) return;
      apiDispatch({
        type: 'card/edit',
        cardId: card.id,
        title,
        description,
        dueDate: dueDate || null,
        link: link.trim() || null,
      });
    }
  };

  const handleDelete = () => {
    if (!card) return;
    if (window.confirm(t('card.deleteConfirm', { title: card.title }))) {
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
          style={{
            background: card.color && COLOR_MAP[card.color] ? COLOR_MAP[card.color] : undefined,
          }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder={t('card.titlePlaceholder')}
        />
        <div>
          <label className="modal-label">{t('card.descriptionLabel')}</label>
          <textarea
            className="modal-desc-input"
            value={description}
            onChange={(e) => {
              const nextDescription = e.target.value;
              setDescription(nextDescription);
              if (!link.trim()) {
                const firstHttpsUrl = nextDescription.match(/https:\/\/[^ ]+(?= |$)/i)?.[0];
                if (firstHttpsUrl) {
                  setLink(firstHttpsUrl);
                  setLinkAutofilled(true);
                }
              }
            }}
            onBlur={save}
            placeholder={t('card.descriptionPlaceholder')}
          />
        </div>
        <div>
          <label className="modal-label" htmlFor="card-link-input">{t('card.link')}</label>
          <input
            id="card-link-input"
            type="url"
            className="modal-date-input"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setLinkAutofilled(false);
            }}
            onBlur={save}
            placeholder={t('card.linkPlaceholder')}
          />
          {linkAutofilled && <p className="modal-link-confirmation" role="status">{t('card.linkAutofilled')}</p>}
        </div>
        <div>
          <label className="modal-label" htmlFor="card-due-date-input">{t('card.dueDate')}</label>
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
            {t('card.lastModifiedBy', { author: card.modifiedByEmail || card.modifiedBy })}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="modal-delete-btn"
            onClick={handleDelete}
          >
            {t('card.delete')}
          </button>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => {
              save();
              onClose();
            }}
          >
            {t('card.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
