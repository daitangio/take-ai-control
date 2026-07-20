import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../state/StoreContext';

interface Props {
  cardId: string;
  listId: string;
  onClick: () => void;
}

export function CardTile({ cardId, listId, onClick }: Props) {
  const { state } = useStore();
  const card = state.cards[cardId];

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

  if (!card) return null;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  const showEditorIcon =
    card.isModifiedByCurrentUser === false && !!card.modifiedByEmail;

  return (
    <div
      ref={setNodeRef}
      className={`card-tile${isDragging ? ' card-tile--dragging' : ''}`}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      role="button"
      tabIndex={0}
    >
      <span className="card-tile__title">{card.title}</span>
      {showEditorIcon && (
        <span
          className="card-tile__editor-icon"
          title={card.modifiedByEmail!}
          aria-label={`Edited by ${card.modifiedByEmail}`}
        >
          ✎
        </span>
      )}
    </div>
  );
}
