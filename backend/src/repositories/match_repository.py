from database import get_db_connection


class MatchRepository:
    @staticmethod
    def create(
        question_id: int,
        mentor_id: int,
        similarity_score: float | None = None,
        ai_briefing: str | None = None,
    ) -> dict:
        query = """
            INSERT INTO matches (question_id, mentor_id, similarity_score, ai_briefing, status)
            VALUES (%s, %s, %s, %s, 'active')
            RETURNING id, question_id, mentor_id, similarity_score, ai_briefing, status,
                      first_response_at, completed_at, created_at;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (question_id, mentor_id, similarity_score, ai_briefing))
            return cur.fetchone()

    @staticmethod
    def find_by_id(match_id: int) -> dict | None:
        query = """
            SELECT id, question_id, mentor_id, similarity_score, ai_briefing, status,
                   first_response_at, completed_at, created_at
            FROM matches
            WHERE id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (match_id,))
            return cur.fetchone()

    @staticmethod
    def find_detail_by_id(match_id: int) -> dict | None:
        query = """
            SELECT m.id, m.question_id, q.problem_description,
                   q.student_id, stu.full_name AS student_name,
                   m.mentor_id, men.full_name AS mentor_name,
                   m.similarity_score, m.ai_briefing,
                   m.status, m.first_response_at, m.completed_at, m.created_at
            FROM matches m
            JOIN questions q ON q.id = m.question_id
            JOIN users stu ON stu.id = q.student_id
            JOIN users men ON men.id = m.mentor_id
            JOIN mentor_profiles mp ON mp.user_id = m.mentor_id
            WHERE m.id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (match_id,))
            return cur.fetchone()

    @staticmethod
    def list_active_by_user_id(user_id: int) -> list[dict]:
        query = """
            SELECT m.id, m.question_id, q.problem_description,
                   q.student_id, stu.full_name AS student_name,
                   m.mentor_id, men.full_name AS mentor_name,
                   m.similarity_score, m.ai_briefing,
                   m.status, m.first_response_at, m.completed_at, m.created_at
            FROM matches m
            JOIN questions q ON q.id = m.question_id
            JOIN users stu ON stu.id = q.student_id
            JOIN users men ON men.id = m.mentor_id
            WHERE (q.student_id = %s OR m.mentor_id = %s)
            ORDER BY CASE WHEN m.status = 'active' THEN 0 ELSE 1 END, m.created_at DESC;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (user_id, user_id))
            return cur.fetchall()

    @staticmethod
    def set_first_response_at(match_id: int) -> None:
        query = """
            UPDATE matches
            SET first_response_at = CURRENT_TIMESTAMP
            WHERE id = %s AND first_response_at IS NULL;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (match_id,))

    @staticmethod
    def complete_match(match_id: int) -> dict | None:
        query = """
            UPDATE matches
            SET status = 'completed', completed_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, question_id, mentor_id, similarity_score, ai_briefing, status,
                      first_response_at, completed_at, created_at;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (match_id,))
            return cur.fetchone()
