import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { BoardEvent } from "../types";
import { getJwt } from "../api/client";

export function useWebSocket(boardId: string | undefined, onEvent: (event: BoardEvent) => void) {
  useEffect(() => {
    if (!boardId) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws"),
      reconnectDelay: 5000,
      connectHeaders: getJwt() ? { Authorization: `Bearer ${getJwt()}` } : undefined
    });

    client.onConnect = () => {
      client.subscribe(`/topic/board/${boardId}`, (message) => {
        onEvent(JSON.parse(message.body) as BoardEvent);
      });
    };

    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [boardId, onEvent]);
}
