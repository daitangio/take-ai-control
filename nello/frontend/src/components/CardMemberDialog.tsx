import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api';
import { useStore } from '../state/StoreContext';
import type { Member } from '../state/types';

interface Props {
  cardId: string;
  onClose: () => void;
}

export function CardMemberDialog({ cardId, onClose }: Props) {
  const { state, apiDispatch } = useStore();
  const card = state.cards[cardId];
  const [options, setOptions] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const loadOptions = useCallback(async () => {
    try {
      const list = await api.listCardMemberOptions(cardId);
      setOptions(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (!card) onClose();
  }, [card, onClose]);

  if (!card) return null;

  const assigned = card.members ?? [];
  const assignedIds = new Set(assigned.map((member) => member.id));

  const toggleMember = async (member: Member) => {
    setError(null);
    try {
      if (assignedIds.has(member.id)) {
        await apiDispatch({ type: 'card/member/remove', cardId, memberId: member.id });
      } else {
        await apiDispatch({ type: 'card/member/add', cardId, member });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <h3 style={{ margin: '0 0 16px' }}>Card members</h3>
        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        ) : options.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No eligible members.</p>
        ) : (
          <ul className="card-member-list">
            {options.map((member) => {
              const checked = assignedIds.has(member.id);
              return (
                <li key={member.id} className="card-member-list__item">
                  <span>{member.email}</span>
                  <button
                    type="button"
                    className={`card-member-list__toggle${checked ? ' card-member-list__toggle--on' : ''}`}
                    onClick={() => toggleMember(member)}
                    aria-pressed={checked}
                  >
                    {checked ? 'Remove' : 'Add'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {error && (
          <p style={{ color: 'var(--color-error, #d32f2f)', fontSize: 13, marginTop: 8 }}>
            {error}
          </p>
        )}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
