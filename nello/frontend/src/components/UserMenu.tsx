import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../state/AuthContext';
import { useStore } from '../state/StoreContext';
import { useTranslation } from 'react-i18next';

interface UserMenuProps {
  onSettingsClick: () => void;
}

export function UserMenu({ onSettingsClick }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundMenuOpen, setBackgroundMenuOpen] = useState(false);
  const { logout, email } = useAuth();
  const { state, apiDispatch } = useStore();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const activeBoard = state.activeBoardId ? state.boards[state.activeBoardId] : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setBackgroundMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = email ? email.substring(0, 19) : t('userMenu.userFallback');

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('userMenu.ariaLabel')}
      >
        ...
      </button>
      {isOpen && (
        <div className="user-menu-dropdown">
          {activeBoard && (
            <>
              <button
                type="button"
                className="user-menu-item"
                aria-expanded={backgroundMenuOpen}
                onClick={() => setBackgroundMenuOpen((open) => !open)}
              >
                {t('board.background')}
              </button>
              {backgroundMenuOpen && (
                <div className="board-background-menu user-menu-background" role="group" aria-label={t('board.background')}>
                  {([
                    [null, 'none'],
                    ['mountain', 'mountain'],
                    ['sea', 'sea'],
                    ['sport', 'sport'],
                  ] as const).map(([background, label]) => (
                    <button
                      key={label}
                      type="button"
                      role="menuitemradio"
                      aria-checked={activeBoard.background === background}
                      className={`board-background-option board-background-option--${label}`}
                      onClick={() => {
                        apiDispatch({ type: 'board/background', boardId: activeBoard.id, background });
                        setBackgroundMenuOpen(false);
                        setIsOpen(false);
                      }}
                    >
                      <span className="board-background-preview" aria-hidden="true" />
                      <span>{t(`board.background${label[0].toUpperCase()}${label.slice(1)}`)}</span>
                      {activeBoard.background === background && <span aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <button className="user-menu-item" onClick={() => { setIsOpen(false); onSettingsClick(); }}>
            {displayName}'s {t('userMenu.settings')}
          </button>
          <button className="user-menu-item logout-btn" onClick={logout}>
            {t('userMenu.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
