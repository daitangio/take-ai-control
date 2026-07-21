from pydantic import BaseModel, Field

from ..cards.models import MemberBrief


class ListCreate(BaseModel):
    id: str
    boardId: str
    name: str = Field(min_length=1, pattern=r"\S")


class ListUpdate(BaseModel):
    name: str = Field(min_length=1, pattern=r"\S")


class ListResponse(BaseModel):
    id: str
    boardId: str
    name: str
    cardIds: list[str]


class CardBrief(BaseModel):
    """Card summary inside a list."""
    id: str
    title: str
    description: str
    dueDate: str | None = None
    members: list[MemberBrief] = Field(default_factory=list)
    modifiedBy: str | None = None
    modifiedByEmail: str | None = None
    isModifiedByCurrentUser: bool | None = None


class ListBrief(BaseModel):
    """Used inside BoardDetailResponse."""
    id: str
    name: str
    cards: list[CardBrief]


class ReorderRequest(BaseModel):
    listIds: list[str]
