import { useMemo, useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { createCard } from "../api/cards";
import { deleteList, updateList } from "../api/lists";
import { CardItem } from "./CardItem";
import { useBoardStore } from "../store/boardStore";
import type { BoardList, Card } from "../types";

interface ListColumnProps {
  list: BoardList;
  cards: Card[];
  boardId: string;
  onCardClick: (card: Card) => void;
}

export function ListColumn({ list, cards, boardId, onCardClick }: ListColumnProps) {
  const addCard = useBoardStore((state) => state.addCard);
  const updateListInStore = useBoardStore((state) => state.updateList);
  const removeList = useBoardStore((state) => state.removeList);
  const [title, setTitle] = useState(list.name);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setNodeRef, isOver } = useDroppable({ id: `list:${list.id}`, data: { type: "list", listId: list.id } });
  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);

  const handleRename = async () => {
    const nextName = title.trim();
    setEditingTitle(false);
    if (!nextName || nextName === list.name) {
      setTitle(list.name);
      return;
    }
    try {
      updateListInStore(await updateList(boardId, list.id, { name: nextName }));
    } catch (err) {
      setTitle(list.name);
      setError(err instanceof Error ? err.message : "Failed to rename list");
    }
  };

  const handleAddCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const titleValue = newCardTitle.trim();
    if (!titleValue) {
      return;
    }
    setError(null);
    try {
      addCard(await createCard(boardId, list.id, titleValue));
      setNewCardTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create card");
    }
  };

  const handleDeleteList = async () => {
    setError(null);
    try {
      await deleteList(boardId, list.id);
      removeList(list.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete list");
    }
  };

  return (
    <section className="list-column">
      <div className="list-header">
        {editingTitle ? (
          <input
            className="list-title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleRename();
              }
              if (event.key === "Escape") {
                setTitle(list.name);
                setEditingTitle(false);
              }
            }}
            autoFocus
          />
        ) : (
          <button type="button" className="list-title-button" onClick={() => setEditingTitle(true)}>
            {list.name}
          </button>
        )}
        <button type="button" className="ghost-button" onClick={handleDeleteList}>
          Delete
        </button>
      </div>
      <div ref={setNodeRef} className={`card-list ${isOver ? "card-list-over" : ""}`}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card, index) => (
            <CardItem key={card.id} card={card} listId={list.id} index={index} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>
      <form className="stack" onSubmit={handleAddCard}>
        <input
          value={newCardTitle}
          onChange={(event) => setNewCardTitle(event.target.value)}
          placeholder="Add a card"
        />
        <button type="submit" className="secondary-button">
          Add card
        </button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
}
