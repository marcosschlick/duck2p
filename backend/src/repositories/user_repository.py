from database import get_db_connection
from models.user import User


class UserRepository:
    @staticmethod
    def create(user: User) -> dict:
        query = """
            INSERT INTO users (full_name, email, student_id, password_hash, course)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, full_name, email, student_id, course, created_at;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(
                query,
                (
                    user.full_name,
                    user.email,
                    user.student_id,
                    user.password_hash,
                    user.course,
                ),
            )
            return cur.fetchone()

    @staticmethod
    def find_by_email(email: str) -> dict | None:
        query = """
            SELECT id, full_name, email, student_id, password_hash, course, created_at
            FROM users
            WHERE email = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (email,))
            return cur.fetchone()

    @staticmethod
    def find_by_student_id(student_id: str) -> dict | None:
        query = """
            SELECT id, full_name, email, student_id, password_hash, course, created_at
            FROM users
            WHERE student_id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (student_id,))
            return cur.fetchone()

    @staticmethod
    def find_by_id(user_id: int) -> dict | None:
        query = """
            SELECT id, full_name, email, student_id, password_hash, course, created_at
            FROM users
            WHERE id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchone()
