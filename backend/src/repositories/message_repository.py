from database import get_db_connection


class MessageRepository:
    @staticmethod
    def create(match_id: int, sender_id: int | None, content: str) -> dict:
        query = """
            INSERT INTO messages (match_id, sender_id, content)
            VALUES (%s, %s, %s)
            RETURNING id, match_id, sender_id, content, created_at;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (match_id, sender_id, content))
            return cur.fetchone()

    @staticmethod
    def list_by_match_id(match_id: int) -> list[dict]:
        query = """
            SELECT m.id, m.match_id, m.sender_id, COALESCE(u.full_name, 'Duck Bot') AS sender_name, m.content, m.created_at
            FROM messages m
            LEFT JOIN users u ON u.id = m.sender_id
            WHERE m.match_id = %s
            ORDER BY m.created_at ASC;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (match_id,))
            return cur.fetchall()
