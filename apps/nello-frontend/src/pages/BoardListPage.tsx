import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardsApi } from '../api/boards'
import type { Board } from '../types'

export default function BoardListPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [name, setName] = useState('')
  const navigate = useNavigate()

  useEffect(() => { boardsApi.list().then(setBoards) }, [])

  async function create() {
    if (!name.trim()) return
    const board = await boardsApi.create(name.trim())
    setBoards(b => [...b, board])
    setName('')
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: '0 0 16px' }}>My Boards</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="New board name" style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, flex: 1 }} />
        <button onClick={create} style={btnStyle}>Create</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {boards.map(b => (
          <div key={b.id} onClick={() => navigate(`/boards/${b.id}`)}
            style={{ padding: '16px 20px', background: '#0052cc', color: '#fff', borderRadius: 6, cursor: 'pointer', minWidth: 160 }}>
            <strong>{b.name}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = { padding: '6px 14px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
