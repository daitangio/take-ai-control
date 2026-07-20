from pydantic import BaseModel, Field


class CardCreate(BaseModel):
    id: str
    listId: str
    title: str = Field(min_length=1, pattern=r"\S")


class CardUpdate(BaseModel):
    title: str = Field(min_length=1, pattern=r"\S")
    description: str = ""


class CardResponse(BaseModel):
    id: str
    listId: str
    title: str
    description: str
    modifiedBy: str | None = None


class CardMoveRequest(BaseModel):
    toListId: str
    index: int = Field(ge=0)
