import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Card } from "../types";

interface CardItemProps {
  card: Card;
  listId: string;
  index: number;
  onClick: () => void;
}

export function CardItem({ card, listId, index, onClick }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card, listId, index }
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`card-item ${isDragging ? "dragging" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <span className="card-title">{card.title}</span>
      <div className="card-meta">
        {card.dueDate ? <span className="badge">{card.dueDate}</span> : null}
        {card.assignee?.email ? <span className="muted">{card.assignee.email}</span> : null}
      </div>
    </button>
  );
}
