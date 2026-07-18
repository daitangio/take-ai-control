import { useMemo, useState } from "react";
import { closestCorners, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useNavigate, useParams } from "react-router-dom";
import { createList } from "../api/lists";
import { moveCard } from "../api/cards";
import { ListColumn } from "../components/ListColumn";
import { CardDetailModal } from "../components/CardDetailModal";
import { ShareBoardModal } from "../components/ShareBoardModal";
import { useBoard } from "../hooks/useBoard";
import { useAuthStore } from "../store/authStore";
import { useBoardStore } from "../store/boardStore";
import type { Card } from "../types";

interface SelectedCardState {
  card: Card;
  listId: string;
}

const getDropPosition = (cards: Card[], overId: string | null) => {
  if (!cards.length) {
    return 1000;
  }
  if (!overId) {
    return cards[cards.length - 1].position + 1000;
  }
  const overIndex = cards.findIndex((card) => card.id === overId);
  if (overIndex === -1) {
    return cards[cards.length - 1].position + 1000;
  }
  const current = cards[overIndex].position;
  const next = cards[overIndex + 1]?.position;
  return next ? current + Math.max(1, Math.floor((next - current) / 2)) : current + 1000;
};

export function BoardPage() {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const logout = useAuthStore((state) => state.logout);
  const addList = useBoardStore((state) => state.addList);
  const updateCardInStore = useBoardStore((state) => state.updateCard);
  const removeCard = useBoardStore((state) => state.removeCard);
  const lists = useBoardStore((state) => state.lists);
  const cardsByList = useBoardStore((state) => state.cards);
  const { board, loading, error } = useBoard(boardId ?? "");
  const [newListName, setNewListName] = useState("");
  const [pageError, setPageError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<SelectedCardState | null>(null);
  const [sharing, setSharing] = useState(false);

  const orderedLists = useMemo(() => lists, [lists]);

  if (!boardId) {
    return <p className="error-text">Missing board id</p>;
  }

  const handleAddList = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newListName.trim();
    if (!name) {
      return;
    }
    try {
      addList(await createList(boardId, name));
      setNewListName("");
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to create list");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeData = active.data.current as { listId?: string } | undefined;
    const overData = over.data.current as { type?: string; listId?: string } | undefined;
    const sourceListId = activeData?.listId;
    const targetListId =
      overData?.type === "list"
        ? overData.listId
        : (over.data.current as { listId?: string } | undefined)?.listId;

    if (!sourceListId || !targetListId) {
      return;
    }

    const targetCards = cardsByList[targetListId] ?? [];
    const position = getDropPosition(targetCards, typeof over.id === "string" && over.id !== active.id ? String(over.id) : null);

    try {
      updateCardInStore(await moveCard(boardId, sourceListId, String(active.id), targetListId, position));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to move card");
    }
  };

  return (
    <main className="board-page">
      <header className="page-header">
        <div>
          <button type="button" className="back-link" onClick={() => navigate("/boards")}>
            ← Boards
          </button>
          <h1>{board?.name ?? "Board"}</h1>
        </div>
        <div className="toolbar">
          <button type="button" className="secondary-button" onClick={() => setSharing(true)}>
            Share
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {loading ? <p className="muted">Loading board…</p> : null}
      {error || pageError ? <p className="error-text">{error ?? pageError}</p> : null}

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="board-scroll">
          {orderedLists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              cards={cardsByList[list.id] ?? []}
              boardId={boardId}
              onCardClick={(card) => setSelectedCard({ card, listId: list.id })}
            />
          ))}
          <form className="list-column add-list-column" onSubmit={handleAddList}>
            <h2>Add list</h2>
            <input
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              placeholder="List name"
            />
            <button type="submit" className="primary-button">
              Add list
            </button>
          </form>
        </div>
      </DndContext>

      {selectedCard ? (
        <CardDetailModal
          card={selectedCard.card}
          listId={selectedCard.listId}
          boardId={boardId}
          onClose={() => setSelectedCard(null)}
          onUpdate={(card) => updateCardInStore(card)}
          onDelete={(cardId) => removeCard(cardId)}
        />
      ) : null}
      {sharing ? <ShareBoardModal boardId={boardId} onClose={() => setSharing(false)} /> : null}
    </main>
  );
}
