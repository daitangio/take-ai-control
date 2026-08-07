import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api';
import type { ArchivedCard } from '../api';
import { useStore } from '../state/StoreContext';
import { useTranslation } from 'react-i18next';
import { toLocalizedErrorMessage } from '../i18n/backendErrors';

interface Props {
  boardId: string;
  sourceListId: string;
  listName: string;
  onClose: () => void;
}

export function ArchivedItemsDialog({ boardId, sourceListId, listName, onClose }: Props) {
  const { state, loadBoards } = useStore();
  const { t, i18n } = useTranslation();
  const [archivedCards, setArchivedCards] = useState<ArchivedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const loadArchivedCards = useCallback(async () => {
    try {
      const cards = await api.getArchivedCards(boardId);
      setArchivedCards(cards);
      setError(null);
    } catch (err) {
      setError(toLocalizedErrorMessage(t, err));
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadArchivedCards();
  }, [loadArchivedCards]);

  const toggleSelect = (cardId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === archivedCards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(archivedCards.map((c) => c.id)));
    }
  };

  const handleApply = async () => {
    if (selectedIds.size === 0) return;
    setError(null);
    setApplying(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((cardId) =>
          api.unarchiveCard(cardId, sourceListId),
        ),
      );
      onClose();
      loadBoards();
    } catch (err) {
      setError(toLocalizedErrorMessage(t, err));
      setApplying(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Group cards by original list
  const grouped = groupBy(archivedCards, (c) => c.originalListId);

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <h3 style={{ margin: '0 0 16px' }}>{t('archived.title')}</h3>

        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>{t('archived.loading')}</p>
        ) : archivedCards.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>{t('archived.empty')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label
              style={{
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.size === archivedCards.length && archivedCards.length > 0}
                onChange={toggleAll}
                style={{ marginRight: 8 }}
              />
              {t('archived.selectAll')}
            </label>
            {Array.from(grouped.entries()).map(([originalListId, cards]) => (
              <div key={originalListId}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    margin: '0 0 8px',
                  }}
                >
                  {t('archived.fromList', {
                    name: state.lists[originalListId]?.name ?? t('archived.unknownList'),
                  })}
                </p>
                <ul className="card-member-list">
                  {cards.map((card) => (
                    <li
                      key={card.id}
                      className="card-member-list__item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleSelect(card.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(card.id)}
                        onChange={() => toggleSelect(card.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ marginRight: 12, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 500 }}>{card.title}</span>
                        <br />
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          {card.archivedByEmail ?? t('archived.unknownUser')} &middot;{' '}
                          {formatDate(card.archivedAt, i18n.language)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                  {t('archived.restoreHint', { name: listName })}
            </p>
          </div>
        )}

        {error && (
          <p style={{ color: 'var(--color-error, #d32f2f)', fontSize: 13, marginTop: 8 }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {selectedIds.size > 0 ? t('archived.selected', { count: selectedIds.size }) : ''}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="modal-close-btn" onClick={onClose}>
              {t('archived.close')}
            </button>
            <button
              type="button"
              className="modal-close-btn"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                opacity: selectedIds.size === 0 || applying ? 0.5 : 1,
              }}
              onClick={handleApply}
              disabled={selectedIds.size === 0 || applying}
            >
              {applying ? t('archived.applying') : `${t('archived.apply')}${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}
