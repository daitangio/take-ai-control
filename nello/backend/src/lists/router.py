import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import get_db, get_current_user
from .models import ListCreate, ListUpdate, ListResponse, ReorderRequest
from .service import create_list, update_list, delete_list, reorder_lists

router = APIRouter()


@router.post("/lists", response_model=ListResponse, status_code=status.HTTP_201_CREATED)
def create(
    req: ListCreate,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    result = create_list(db, user["id"], req.id, req.boardId, req.name)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return result


@router.patch("/lists/{list_id}", response_model=ListResponse)
def update(
    list_id: str,
    req: ListUpdate,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    result = update_list(db, user["id"], list_id, req.name)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return result


@router.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    list_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    if not delete_list(db, user["id"], list_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return None


@router.put("/boards/{board_id}/lists/reorder", status_code=status.HTTP_200_OK)
def reorder(
    board_id: str,
    req: ReorderRequest,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    if not reorder_lists(db, user["id"], board_id, req.listIds):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return {"status": "ok"}
