import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { listsApi } from '../api/lists'
import { cardsApi } from '../api/cards'
import CardItem from './CardItem'
import CardDetailModal from './CardDetailModal'
import type { BoardList, Card } from '../types'

interface Props { list: BoardList; cards: Card[]; boardId: string }

export default function ListColumn({ list, cards, boardId }: Props) {
  const { setNodeRef } = useDroppable({ id: list.id })
  const [newTitle, setNewTitle] = useState('')
  const [selected, setSelected] = useState<Card | null>(null)

  async function addCard() {
    if (!newTitle.trim()) return
    await cardsApi.create(list.id, newTitle.trim())
    setNewTitle('')
  }

  async function deleteList() {
    if (confirm(`Delete list "${list.name}"?`))
      await listsApi.delete(boardId, list.id)
  }

  return (
    <div style={colStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>{list.name}</strong>
        <button onClick={deleteList} style={iconBtn} title="Delete list">✕</button>
      </div>
      <div ref={setNodeRef} style={{ minHeight: 8 }}>
        <SortableContext items={cards.map(c => `${c.id}::${list.id}`)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <CardItem key={card.id} card={card} listId={list.id} onClick={() => setSelected(card)} />
          ))}
        </SortableContext>
      </div>
      <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
        placeholder="Add card…" style={{ ...inputStyle, marginTop: 8 }} />
      <button onClick={addCard} style={addBtn}>+ Add card</button>
      {selected && <CardDetailModal card={selected} listId={list.id} onClose={() => setSelected(null)} />}
    </div>
  )
}

const colStyle: React.CSSProperties = { background: '#f0f2f5', borderRadius: 8, padding: 12, minWidth: 220, maxWidth: 220 }
const inputStyle: React.CSSProperties = { padding: '5px 8px', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box', fontSize: 13 }
const addBtn: React.CSSProperties = { marginTop: 4, width: '100%', padding: '5px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, textAlign: 'left' }
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 12 }
