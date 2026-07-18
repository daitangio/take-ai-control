import { useCallback, useEffect, useState } from "react";
import { getBoard } from "../api/boards";
import { getCards } from "../api/cards";
import { getLists } from "../api/lists";
import type { BoardEvent } from "../types";
import { useBoardStore } from "../store/boardStore";
import { useWebSocket } from "./useWebSocket";

export function useBoard(boardId: string) {
  const board = useBoardStore((state) => state.board);
  const lists = useBoardStore((state) => state.lists);
  const cards = useBoardStore((state) => state.cards);
  const setBoard = useBoardStore((state) => state.setBoard);
  const setLists = useBoardStore((state) => state.setLists);
  const setCards = useBoardStore((state) => state.setCards);
  const handleBoardEvent = useBoardStore((state) => state.handleBoardEvent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextBoard = await getBoard(boardId);
      const nextLists = await getLists(boardId);
      const nextCards = await Promise.all(nextLists.map(async (list) => [list.id, await getCards(boardId, list.id)] as const));

      setBoard(nextBoard);
      setLists(nextLists);
      nextCards.forEach(([listId, listCards]) => setCards(listId, listCards));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board");
    } finally {
      setLoading(false);
    }
  }, [boardId, setBoard, setCards, setLists]);

  const onEvent = useCallback(
    (event: BoardEvent) => {
      handleBoardEvent(event);
      void loadBoard();
    },
    [handleBoardEvent, loadBoard]
  );

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  useWebSocket(boardId, onEvent);

  return { board, lists, cards, loading, error };
}
