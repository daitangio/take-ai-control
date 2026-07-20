from pydantic import BaseModel, Field


class BoardCreate(BaseModel):
    id: str
    name: str = Field(min_length=1, pattern=r"\S")


class BoardUpdate(BaseModel):
    name: str = Field(min_length=1, pattern=r"\S")


class BoardResponse(BaseModel):
    id: str
    name: str
    listIds: list[str]
    isShared: bool
    isOwner: bool


class BoardDetailResponse(BaseModel):
    id: str
    name: str
    lists: list["ListBrief"]


from ..lists.models import ListBrief  # noqa: E402
BoardDetailResponse.model_rebuild()
