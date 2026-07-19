import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import get_db, get_current_user
from .models import BoardCreate, BoardUpdate, BoardResponse, BoardDetailResponse
from .service import create_board, get_boards, get_board, update_board, delete_board

router = APIRouter()


@router.get("/boards", response_model=list[BoardResponse])
def list_boards(
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    return get_boards(db, user["id"])


@router.post("/boards", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create(
    req: BoardCreate,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    return create_board(db, user["id"], req.id, req.name)


@router.get("/boards/{board_id}", response_model=BoardDetailResponse)
def get(
    board_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    board = get_board(db, user["id"], board_id)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return board


@router.patch("/boards/{board_id}", response_model=BoardResponse)
def update(
    board_id: str,
    req: BoardUpdate,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    board = update_board(db, user["id"], board_id, req.name)
    if board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    full = get_board(db, user["id"], board_id)
    return {"id": full["id"], "name": full["name"], "listIds": [l["id"] for l in full["lists"]]}


@router.delete("/boards/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    board_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    if not delete_board(db, user["id"], board_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return None
