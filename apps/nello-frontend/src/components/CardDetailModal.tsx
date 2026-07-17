import { useState } from 'react'
import { cardsApi } from '../api/cards'
import type { Card } from '../types'

interface Props { card: Card; listId: string; onClose: () => void }

export default function CardDetailModal({ card, listId, onClose }: Props) {
  const [title, setTitle] = useState(card.title)
  const [desc, setDesc] = useState(card.description ?? '')
  const [due, setDue] = useState(card.dueDate ?? '')
  const [assignee, setAssignee] = useState(card.assignee?.email ?? '')

  async function save() {
    await cardsApi.update(listId, card.id, { title, description: desc, dueDate: due || undefined, assigneeEmail: assignee || undefined } as never)
    onClose()
  }

  async function del() {
    if (confirm('Delete this card?')) {
      await cardsApi.delete(listId, card.id)
      onClose()
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 12px' }}>Edit Card</h3>
        <label style={lbl}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={inp} />
        <label style={lbl}>Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
        <label style={lbl}>Due date</label>
        <input type="date" value={due} onChange={e => setDue(e.target.value)} style={inp} />
        <label style={lbl}>Assignee email</label>
        <input value={assignee} onChange={e => setAssignee(e.target.value)} style={inp} placeholder="user@example.com" />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={save} style={saveBtn}>Save</button>
          <button onClick={del} style={delBtn}>Delete</button>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, width: 380, display: 'flex', flexDirection: 'column', gap: 4 }
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#555', marginTop: 8 }
const inp: React.CSSProperties = { padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' }
const saveBtn: React.CSSProperties = { flex: 1, padding: '7px 0', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
const delBtn: React.CSSProperties = { padding: '7px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
const cancelBtn: React.CSSProperties = { padding: '7px 12px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }
