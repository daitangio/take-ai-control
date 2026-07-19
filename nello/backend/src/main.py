import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db
from .auth.router import router as auth_router
from .boards.router import router as boards_router
from .lists.router import router as lists_router
from .cards.router import router as cards_router

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="nello API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(boards_router, prefix="/api", tags=["boards"])
app.include_router(lists_router, prefix="/api", tags=["lists"])
app.include_router(cards_router, prefix="/api", tags=["cards"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
