import logging
import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import get_db
from .models import RegisterRequest, LoginRequest, TokenResponse
from .service import register_user, authenticate_user, create_token

logger = logging.getLogger(__name__)

router = APIRouter()

# Register API Disabled:
# Registration will be done in a different way in the future and for the meantime it is manual


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_token(user["id"])    
    return TokenResponse(access_token=token)
