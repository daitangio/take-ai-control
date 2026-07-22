#!/usr/bin/env python3
"""Create a user in the nello database from the command line.

Usage:
    python create_user.py <email> <password>

Example:
    python create_user.py alice@example.com mysecretpass
"""

import argparse
import sqlite3
import sys
import uuid
from pathlib import Path

import bcrypt


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create a new user in the nello database."
    )
    parser.add_argument("email", help="User email (used as login username)")
    parser.add_argument("password", help="User password (will be bcrypt-hashed)")
    args = parser.parse_args()

    db_path = Path(__file__).resolve().parent / "nello.db"
    if not db_path.exists():
        print(f"Error: database not found at {db_path}", file=sys.stderr)
        sys.exit(1)

    user_id = str(uuid.uuid4())
    hashed = bcrypt.hashpw(
        args.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        conn.execute(
            "INSERT INTO user (id, email, password) VALUES (?, ?, ?)",
            (user_id, args.email, hashed),
        )
        conn.commit()
        print(f"User created: id={user_id} email={args.email}")
    except sqlite3.IntegrityError:
        print(f"Error: email '{args.email}' is already registered", file=sys.stderr)
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
