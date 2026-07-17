import { useState } from 'react'
import { boardsApi } from '../api/boards'

interface Props { boardId: string; onClose: () => void }

export default function ShareBoardModal({ boardId, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  async function share() {
    if (!email.trim()) return
    await boardsApi.share(boardId, email.trim())
    setDone(true)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 12px' }}>Share Board</h3>
        {done ? <p>Shared! The user can now access this board.</p> : <>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Collaborator email" style={inp} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={share} style={saveBtn}>Share</button>
            <button onClick={onClose} style={cancelBtn}>Cancel</button>
          </div>
        </>}
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: 24, width: 320 }
const inp: React.CSSProperties = { padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' }
const saveBtn: React.CSSProperties = { flex: 1, padding: '7px 0', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
const cancelBtn: React.CSSProperties = { padding: '7px 12px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }
