import { closestCorners, type CollisionDetection } from '@dnd-kit/core';

/**
 * GG  Core bugfix
 * When the active item is a list, pass only sortable list containers belonging to the active board to `closestCorners`; card drags continue using every registered drop target. 
 * This fixes the ambiguity at its source without changing card behavior
 * 
 * @param args 
 * 
 * @returns 
 */
export const boardCollisionDetection: CollisionDetection = (args) => {
  if (args.active.data.current?.type !== 'list') return closestCorners(args);

  const boardId = args.active.data.current.boardId;
  return closestCorners({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (container) =>
        container.data.current?.type === 'list' &&
        container.data.current.boardId === boardId,
    ),
  });
};
