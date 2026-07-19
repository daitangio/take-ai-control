import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import get_db, get_current_user
from .models import CardCreate, CardUpdate, CardResponse, CardMoveRequest
from .service import create_card, update_card, delete_card, move_card

router = APIRouter()


@router.post("/cards", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create(
    req: CardCreate,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    result = create_card(db, user["id"], req.id, req.listId, req.title)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    return result


@router.patch("/cards/{card_id}", response_model=CardResponse)
def update(
    card_id: str,
    req: CardUpdate,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    result = update_card(db, user["id"], card_id, req.title, req.description)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return result


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    card_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    if not delete_card(db, user["id"], card_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return None


@router.put("/cards/{card_id}/move", status_code=status.HTTP_200_OK)
def move(
    card_id: str,
    req: CardMoveRequest,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    if not move_card(db, user["id"], card_id, req.toListId, req.index):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"status": "ok"}
