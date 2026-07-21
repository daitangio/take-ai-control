from pydantic import BaseModel, Field


class MemberBrief(BaseModel):
    id: str
    email: str


class CardCreate(BaseModel):
    id: str
    listId: str
    title: str = Field(min_length=1, pattern=r"\S")


class CardUpdate(BaseModel):
    title: str = Field(min_length=1, pattern=r"\S")
    description: str = ""
    dueDate: str | None = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")


class CardResponse(BaseModel):
    id: str
    listId: str
    title: str
    description: str
    dueDate: str | None = None
    members: list[MemberBrief] = Field(default_factory=list)
    modifiedBy: str | None = None
    modifiedByEmail: str | None = None
    isModifiedByCurrentUser: bool | None = None


class CardMoveRequest(BaseModel):
    toListId: str
    index: int = Field(ge=0)


class CardMemberRequest(BaseModel):
    userId: str
