import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from '../state/StoreContext';
import { useDndSensors } from '../dnd/useDndSensors';
import { ListColumn } from './ListColumn';
import { CardTile } from './CardTile';
import { CardModal } from './CardModal';
import { CardMemberDialog } from './CardMemberDialog';
import './ListColumn.css';

export function BoardView() {
  const { state, apiDispatch } = useStore();
  const activeBoardId = state.activeBoardId;
  const board = activeBoardId ? state.boards[activeBoardId] : null;

  const [addingList, setAddingList] = useState(false);
  const [listName, setListName] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [membersCardId, setMembersCardId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);

  const sensors = useDndSensors();

  if (!board) return null;

  const handleAddList = () => {
    if (listName.trim() && activeBoardId) {
      // GG Nice id name are better
      // If two list name are equal, we cut them and add a magic uid at end
      var listId=listName.slice(0,36-8).toLowerCase().replaceAll(" ","-")+"-"+crypto.randomUUID().slice(0,8)
      apiDispatch({
        type: 'list/create',
        listId: listId,
        boardId: activeBoardId,
        name: listName,
      });
      setListName('');
      setAddingList(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
    setActiveDragType(event.active.data.current?.type ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setActiveDragType(null);

    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // ── Card drag ─────────────────
    if (activeData?.type === 'card') {
      const cardId = active.id as string;
      const fromListId = activeData.listId as string;

      let toListId: string;
      let index: number;

      if (overData?.type === 'card') {
        toListId = overData.listId as string;
        const targetList = state.lists[toListId];
        index = targetList ? targetList.cardIds.indexOf(over.id as string) : 0;
      } else if (overData?.type === 'list') {
        // Dropped onto the list droppable zone (e.g., empty list)
        toListId = overData.listId as string;
        const targetList = state.lists[toListId];
        index = targetList ? targetList.cardIds.length : 0;
      } else {
        return;
      }

      const fromList = state.lists[fromListId];
      if (
        fromListId === toListId &&
        fromList &&
        fromList.cardIds.indexOf(cardId) === index
      ) {
        return;
      }

      apiDispatch({
        type: 'card/move',
        cardId,
        fromListId,
        toListId,
        index,
      });
      return;
    }

    // ── List drag ─────────────────
    if (activeData?.type === 'list') {
      const listId = active.id as string;
      const fromBoardId = activeData.boardId as string;
      const b = state.boards[fromBoardId];
      if (!b) return;

      const oldIndex = b.listIds.indexOf(listId);
      const newIndex = b.listIds.indexOf(over.id as string);

      if (oldIndex !== newIndex && newIndex !== -1) {
        const reordered = [...b.listIds];
        reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, listId);
        apiDispatch({
          type: 'list/reorder',
          boardId: fromBoardId,
          listIds: reordered,
        });
      }
    }
  };

  const activeCard =
    activeDragId && activeDragType === 'card'
      ? state.cards[activeDragId]
      : null;

  const handleCardArchived = (cardId: string) => {
    if (selectedCardId === cardId) setSelectedCardId(null);
    if (membersCardId === cardId) setMembersCardId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board-content">
        <SortableContext
          items={board.listIds}
          strategy={horizontalListSortingStrategy}
        >
          {board.listIds.map((listId) => (
            <ListColumn
              key={listId}
              listId={listId}
              boardId={board.id}
              onCardClick={(cardId) => setSelectedCardId(cardId)}
              onCardMembersClick={(cardId) => setMembersCardId(cardId)}
              onCardArchived={handleCardArchived}
            />
          ))}
        </SortableContext>

        <div className="add-list">
          {addingList ? (
            <div className="add-list-form">
              <input
                className="add-list-input"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddList();
                  if (e.key === 'Escape') {
                    setAddingList(false);
                    setListName('');
                  }
                }}
                placeholder="List name"
                autoFocus
              />
              <div className="add-list-actions">
                <button
                  type="button"
                  className="add-list-submit"
                  onClick={handleAddList}
                >
                  Add List
                </button>
                <button
                  type="button"
                  className="add-list-cancel"
                  onClick={() => {
                    setAddingList(false);
                    setListName('');
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="add-list-btn"
              onClick={() => setAddingList(true)}
            >
              + Add List
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeCard ? (
          <CardTile
            cardId={activeCard.id}
            listId=""
            onClick={() => {}}
            enableActions={false}
          />
        ) : null}
      </DragOverlay>

      {selectedCardId && (
        <CardModal
          cardId={selectedCardId}
          onClose={() => setSelectedCardId(null)}
        />
      )}
      {membersCardId && (
        <CardMemberDialog
          cardId={membersCardId}
          onClose={() => setMembersCardId(null)}
        />
      )}
    </DndContext>
  );
}
