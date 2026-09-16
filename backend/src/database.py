import os
from collections.abc import Generator
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "duck")
DB_PASSWORD = os.getenv("DB_PASSWORD", "duckpass")
DB_NAME = os.getenv("DB_NAME", "duck2p_db")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


@contextmanager
def get_db_connection() -> Generator[psycopg.Connection, None, None]:
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
