from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, pattern=r"\S")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, pattern=r"\S")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
