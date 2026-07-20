import { useState, useEffect, useRef } from 'react';
import { useStore } from '../state/StoreContext';
import * as api from '../api';

interface Props {
  boardId: string;
  onClose: () => void;
}

export function MemberDialog({ boardId, onClose }: Props) {
  const { toast } = useStore();
  const [members, setMembers] = useState<api.MemberResponse[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const loadMembers = async () => {
    try {
      const list = await api.listMembers(boardId);
      setMembers(list);
      setError(null);
    } catch {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [boardId]);

  const handleAdd = async () => {
    if (!email.trim()) return;
    try {
      await api.addMember(boardId, email.trim());
      setEmail('');
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await api.removeMember(boardId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
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
        <h3 style={{ margin: '0 0 16px' }}>Members</h3>

        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        ) : (
          <>
            {members.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                No members yet.
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
                      title="Remove member"
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
                placeholder="Email address"
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
                Add
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
