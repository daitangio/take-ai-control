import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '../types'

interface Props { card: Card; listId: string; onClick: () => void }

export default function CardItem({ card, listId, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `${card.id}::${listId}` })

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition, background: '#fff', borderRadius: 4, padding: '8px 10px', marginBottom: 6, cursor: 'grab', boxShadow: '0 1px 2px rgba(0,0,0,.1)' }}
      onClick={onClick}>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{card.title}</div>
      {card.dueDate && <div style={{ fontSize: 11, color: '#e67e22', marginTop: 2 }}>📅 {card.dueDate}</div>}
      {card.assignee && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>👤 {card.assignee.email}</div>}
    </div>
  )
}
