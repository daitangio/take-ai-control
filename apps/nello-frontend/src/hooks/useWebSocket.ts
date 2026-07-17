import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { BoardEvent } from '../types'

export function useWebSocket(boardId: string | null, onEvent: (e: BoardEvent) => void) {
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!boardId) return
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/board/${boardId}`, (msg) => {
          try { onEvent(JSON.parse(msg.body) as BoardEvent) } catch { /* ignore */ }
        })
      },
    })
    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, [boardId, onEvent])
}
