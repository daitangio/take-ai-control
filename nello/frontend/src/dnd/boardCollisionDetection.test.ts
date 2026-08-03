import { describe, expect, it, vi } from 'vitest';
import { closestCorners, type CollisionDetection } from '@dnd-kit/core';
import { boardCollisionDetection } from './boardCollisionDetection';

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...actual,
    closestCorners: vi.fn(() => []),
  };
});

describe('boardCollisionDetection', () => {
  it('only considers sortable columns while dragging a list', () => {
    const sortableList = {
      id: 'l-1',
      data: { current: { type: 'list', boardId: 'b-1' } },
    };
    const nestedListZone = {
      id: 'list-zone-l-1',
      data: { current: { type: 'list', listId: 'l-1' } },
    };
    const nestedCard = {
      id: 'c-1',
      data: { current: { type: 'card', listId: 'l-1' } },
    };
    const otherBoardList = {
      id: 'l-2',
      data: { current: { type: 'list', boardId: 'b-2' } },
    };
    const args = {
      active: { data: { current: { type: 'list', boardId: 'b-1' } } },
      droppableContainers: [
        sortableList,
        nestedListZone,
        nestedCard,
        otherBoardList,
      ],
    } as unknown as Parameters<CollisionDetection>[0];

    boardCollisionDetection(args);

    expect(closestCorners).toHaveBeenCalledWith({
      ...args,
      droppableContainers: [sortableList],
    });
  });

  it('keeps all drop targets available while dragging a card', () => {
    const args = {
      active: { data: { current: { type: 'card', listId: 'l-1' } } },
      droppableContainers: [],
    } as unknown as Parameters<CollisionDetection>[0];

    boardCollisionDetection(args);

    expect(closestCorners).toHaveBeenCalledWith(args);
  });
});
