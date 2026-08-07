import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../state/StoreContext';
import { useTranslation } from 'react-i18next';

const CARD_MENU_CLOSE_EVENT = 'nello:card-menu-close';

const COLOR_MAP: Record<string, string> = {
  red: '#fecaca',
  orange: '#fed7aa',
  green: '#bbf7d0',
  blue: '#bfdbfe',
  violet: '#ddd6fe',
  gray: '#e5e7eb',
};

// GG Semaphore like order
const COLOR_OPTIONS = [ 'green', 'orange','red', 'blue', 'violet', 'gray'] as const;

interface Props {
  cardId: string;
  listId: string;
  onClick: () => void;
  onMembersClick?: () => void;
  onArchived?: () => void;
  enableActions?: boolean;
}

export function CardTile({ cardId, listId, onClick, onMembersClick, onArchived, enableActions = true }: Props) {
  const { state, apiDispatch } = useStore();
  const { t } = useTranslation();
  const card = state.cards[cardId];
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({});
  const menuRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cardId,
    data: { type: 'card', listId },
  });

  const closeMenu = () => {
    setMenuOpen(false);
    setEditingDueDate(false);
  };

  const closeOtherCardMenus = () => {
    window.dispatchEvent(new CustomEvent(CARD_MENU_CLOSE_EVENT, {
      detail: { cardId },
    }));
  };

  useEffect(() => {
    const handleCloseEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ cardId?: string }>).detail;
      if (detail?.cardId !== cardId) closeMenu();
    };

    window.addEventListener(CARD_MENU_CLOSE_EVENT, handleCloseEvent);
    return () => window.removeEventListener(CARD_MENU_CLOSE_EVENT, handleCloseEvent);
  }, [cardId]);

  useEffect(() => {
    if (!menuOpen) return;

    const updateMenuPosition = () => {
      const rect = menuButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({
        position: 'fixed',
        top: rect.bottom + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  if (!card) return null;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    background: card.color && COLOR_MAP[card.color] ? COLOR_MAP[card.color] : undefined,
  };

  const showEditorIcon =
    card.isModifiedByCurrentUser === false && !!card.modifiedByEmail;
  const dueDateLabel = card.dueDate ? t('card.dueDateShort', { date: card.dueDate }) : null;
  const memberCount = card.members?.length ?? 0;

  const updateDueDate = (dueDate: string | null) => {
    apiDispatch({
      type: 'card/edit',
      cardId: card.id,
      title: card.title,
      description: card.description,
      dueDate,
    });
  };

  const archive = () => {
    closeMenu();
    console.log('Archiving...');
    apiDispatch({ type: 'card/archive', cardId: card.id });
    onArchived?.();
  };

  const setColor = (color: string | null) => {
    closeMenu();
    apiDispatch({
      type: 'card/edit',
      cardId: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate,
      color,
    });
  };

  const actionPopup = menuOpen ? createPortal(
    <div
      ref={popupRef}
      className="card-tile__menu-popup"
      role="menu"
      aria-label={t('card.cardActionsMenuAria', { title: card.title })}
      style={menuPosition}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') closeMenu();
      }}
    >
      <div className="card-tile__color-row">
        {COLOR_OPTIONS.map((colorName) => (
          <button
            key={colorName}
            type="button"
            className={`card-tile__color-swatch${card.color === colorName ? ' card-tile__color-swatch--active' : ''}`}
            style={{ background: COLOR_MAP[colorName] }}
            aria-label={`Set color ${colorName}`}
            title={colorName.charAt(0).toUpperCase() + colorName.slice(1)}
            onClick={() => setColor(colorName)}
          />
        ))}
        <button
          type="button"
          className="card-tile__color-clear"
          aria-label={t('card.color.clear')}
          title={t('card.color.clear')}
          onClick={() => setColor(null)}
        >
          ✕
        </button>
      </div>
      <div className="card-tile__menu-separator" />
      <button
        type="button"
        role="menuitem"
        className="card-tile__menu-item"
        onClick={() => {
          closeMenu();
          onClick();
        }}
      >
        {t('card.details')}
      </button>
      <button
        type="button"
        role="menuitem"
        className="card-tile__menu-item"
        onClick={() => {
          closeMenu();
          onMembersClick?.();
        }}
      >
        {t('card.members')}
      </button>
      <button
        type="button"
        role="menuitem"
        className="card-tile__menu-item"
        onClick={() => setEditingDueDate((editing) => !editing)}
      >
        {t('card.dueDate')}
      </button>
      {editingDueDate && (
        <div className="card-tile__due-editor">
          <input
            type="date"
            aria-label={t('card.dueDateForAria', { title: card.title })}
            value={card.dueDate ?? ''}
            onChange={(e) => updateDueDate(e.target.value || null)}
          />
          <button
            type="button"
            onClick={() => updateDueDate(null)}
          >
            {t('card.clear')}
          </button>
        </div>
      )}
      <button
        type="button"
        role="menuitem"
        className="card-tile__menu-item card-tile__menu-item--danger"
        onClick={archive}
      >
        {t('card.archive')}
      </button>
    </div>,
    document.body,
  ) : null;

  return (
    <div
      ref={setNodeRef}
      className={`card-tile${isDragging ? ' card-tile--dragging' : ''}`}
      style={style}
      {...attributes}
      {...listeners}
    >
      <button
        type="button"
        className="card-tile__main"
        onClick={() => {
          closeOtherCardMenus();
          onClick();
        }}
      >
        <span
          title={card.modifiedByEmail ? t('card.editedByTitle', { email: card.modifiedByEmail }) : undefined}
          className="card-tile__title"
        >
          {card.title}
        </span>
        {(dueDateLabel || memberCount > 0) && (
          <span className="card-tile__meta">
            {dueDateLabel && <span>{dueDateLabel}</span>}
            {memberCount > 0 && <span>{t('card.membersCount', { count: memberCount })}</span>}
          </span>
        )}
      </button>
      {showEditorIcon && (
        <span
          className="card-tile__editor-icon"
          title={card.modifiedByEmail!}
          aria-label={t('card.editedByAria', { email: card.modifiedByEmail })}
        >
          ✎
        </span>
      )}
      {enableActions && (
        <div className="card-tile__menu" ref={menuRef}>
          <button
            ref={menuButtonRef}
            type="button"
            className="card-tile__menu-btn"
            aria-label={t('card.cardActionsAria', { title: card.title })}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              closeOtherCardMenus();
              setMenuOpen((open) => !open);
              setEditingDueDate(false);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') closeMenu();
            }}
          >
            ...
          </button>
        </div>
      )}
      {actionPopup}
    </div>
  );
}
