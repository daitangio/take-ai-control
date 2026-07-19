import os

DATABASE_PATH = os.environ.get("NELLO_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "nello.db"))
JWT_SECRET = os.environ.get("NELLO_JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("NELLO_JWT_EXPIRATION_HOURS", "24"))
