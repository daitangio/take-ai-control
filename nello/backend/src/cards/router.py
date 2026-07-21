import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import get_db, get_current_user
from .models import CardCreate, CardUpdate, CardResponse, CardMoveRequest, CardMemberRequest, MemberBrief
from .service import (
    create_card,
    update_card,
    delete_card,
    move_card,
    archive_card,
    list_card_members,
    list_card_member_options,
    add_card_member,
    remove_card_member,
)

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
    due_date_provided = "dueDate" in req.model_fields_set
    result = update_card(
        db,
        user["id"],
        card_id,
        req.title,
        req.description,
        req.dueDate,
        due_date_provided,
    )
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return result


@router.post("/cards/{card_id}/archive", status_code=status.HTTP_204_NO_CONTENT)
def archive(
    card_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    if not archive_card(db, user["id"], card_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return None


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    card_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    if not delete_card(db, user["id"], card_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return None


@router.get("/cards/{card_id}/members", response_model=list[MemberBrief])
def members(
    card_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    result = list_card_members(db, user["id"], card_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return result


@router.get("/cards/{card_id}/member-options", response_model=list[MemberBrief])
def member_options(
    card_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    result = list_card_member_options(db, user["id"], card_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return result


@router.post("/cards/{card_id}/members", response_model=MemberBrief, status_code=status.HTTP_201_CREATED)
def add_member(
    card_id: str,
    req: CardMemberRequest,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    try:
        result = add_card_member(db, user["id"], card_id, req.userId)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return result


@router.delete("/cards/{card_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    card_id: str,
    member_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    if not remove_card_member(db, user["id"], card_id, member_id):
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
