import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../state/AuthContext';

interface UserMenuProps {
  onSettingsClick: () => void;
}

export function UserMenu({ onSettingsClick }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, email } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = email ? email.substring(0, 9) : 'User';

  return (
    <div className="user-menu" ref={menuRef}>
      <button 
        className="user-menu-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Menu"
      >
        {displayName}
      </button>
      {isOpen && (
        <div className="user-menu-dropdown">
          <button className="user-menu-item" onClick={() => { setIsOpen(false); onSettingsClick(); }}>
            Settings
          </button>
          <button className="user-menu-item logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
