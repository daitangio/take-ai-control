import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import get_db, get_current_user
from .models import AddMemberRequest, MemberResponse
from .service import add_member, remove_member, list_members

router = APIRouter()


@router.post("/boards/{board_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def add(
    board_id: str,
    req: AddMemberRequest,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    try:
        result = add_member(db, user["id"], board_id, req.email)
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the board owner can add members",
        )
    except LookupError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return result


@router.delete("/boards/{board_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove(
    board_id: str,
    member_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    result = remove_member(db, user["id"], board_id, member_id)
    if not result:
        # Distinguish: board/member not found vs not authorized
        from ..deps import check_board_access
        role = check_board_access(db, board_id, user["id"])
        if role is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        if role != "owner":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the board owner can remove members")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return None


@router.get("/boards/{board_id}/members", response_model=list[MemberResponse])
def list_members_route(
    board_id: str,
    user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
):
    result = list_members(db, user["id"], board_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return result
