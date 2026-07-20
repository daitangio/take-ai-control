from pydantic import BaseModel, EmailStr


class AddMemberRequest(BaseModel):
    email: EmailStr


class MemberResponse(BaseModel):
    id: str
    email: str
