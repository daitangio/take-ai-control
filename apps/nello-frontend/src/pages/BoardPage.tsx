import { useEffect, useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { boardsApi } from '../api/boards'
import { listsApi } from '../api/lists'
import { cardsApi } from '../api/cards'
import { useBoardStore } from '../store/boardStore'
import { useWebSocket } from '../hooks/useWebSocket'
import ListColumn from '../components/ListColumn'
import ShareBoardModal from '../components/ShareBoardModal'
import type { BoardEvent } from '../types'

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { lists, cards, setLists, setCards, applyEvent } = useBoardStore()
  const [boardName, setBoardName] = useState('')
  const [sharing, setSharing] = useState(false)
  const [newList, setNewList] = useState('')

  useEffect(() => {
    if (!boardId) return
    boardsApi.get(boardId).then(b => setBoardName(b.name))
    listsApi.getAll(boardId).then(ls => {
      setLists(ls)
      ls.forEach(l => cardsApi.getAll(l.id).then(cs => setCards(l.id, cs)))
    })
  }, [boardId])

  const onEvent = useCallback((e: BoardEvent) => applyEvent(e), [applyEvent])
  useWebSocket(boardId ?? null, onEvent)

  async function addList() {
    if (!boardId || !newList.trim()) return
    await listsApi.create(boardId, newList.trim())
    setNewList('')
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !boardId) return
    const [cardId, srcListId] = String(active.id).split('::')
    const targetListId = String(over.id)
    const targetCards = cards[targetListId] ?? []
    const newPos = targetCards.length ? (targetCards[targetCards.length - 1].position + 1000) : 1000
    await cardsApi.move(srcListId, cardId, targetListId, newPos)
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{boardName}</h2>
        <button onClick={() => setSharing(true)} style={btnStyle}>Share</button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', alignItems: 'flex-start' }}>
          {lists.map(list => (
            <ListColumn key={list.id} list={list} cards={cards[list.id] ?? []} boardId={boardId!} />
          ))}
          <div style={{ minWidth: 200 }}>
            <input value={newList} onChange={e => setNewList(e.target.value)}
              placeholder="Add list…" style={inputStyle} />
            <button onClick={addList} style={{ ...btnStyle, marginTop: 6, width: '100%' }}>+ Add list</button>
          </div>
        </div>
      </DndContext>
      {sharing && boardId && <ShareBoardModal boardId={boardId} onClose={() => setSharing(false)} />}
    </div>
  )
}

const btnStyle: React.CSSProperties = { padding: '5px 12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }
const inputStyle: React.CSSProperties = { padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }
