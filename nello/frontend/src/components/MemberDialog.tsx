import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from '../api';
import { useTranslation } from 'react-i18next';
import { toLocalizedErrorMessage } from '../i18n/backendErrors';

interface Props {
  boardId: string;
  onClose: () => void;
}

export function MemberDialog({ boardId, onClose }: Props) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<api.MemberResponse[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const loadMembers = useCallback(async () => {
    try {
      const list = await api.listMembers(boardId);
      setMembers(list);
      setError(null);
    } catch (err) {
      setError(toLocalizedErrorMessage(t, err));
    } finally {
      setLoading(false);
    }
  }, [boardId, t]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleAdd = async () => {
    if (!email.trim()) return;
    try {
      await api.addMember(boardId, email.trim());
      setEmail('');
      await loadMembers();
    } catch (err) {
      setError(toLocalizedErrorMessage(t, err));
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await api.removeMember(boardId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(toLocalizedErrorMessage(t, err));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="modal" style={{ maxWidth: 400 }}>
        <h3 style={{ margin: '0 0 16px' }}>{t('members.title')}</h3>

        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>{t('members.loading')}</p>
        ) : (
          <>
            {members.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {t('members.empty')}
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
                {members.map((m) => (
                  <li
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{m.email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(m.id)}
                      style={{
                        padding: '2px 8px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        fontSize: 18,
                        cursor: 'pointer',
                        borderRadius: 3,
                      }}
                      title={t('members.removeTitle')}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
                placeholder={t('members.emailPlaceholder')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleAdd}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: 4,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: 14,
                }}
              >
                {t('members.add')}
              </button>
            </div>

            {error && (
              <p style={{ color: 'var(--color-error, #d32f2f)', fontSize: 13, marginTop: 8 }}>
                {error}
              </p>
            )}
          </>
        )}

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            {t('members.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
