from database import get_db_connection


class RatingRepository:
    @staticmethod
    def create(
        match_id: int,
        mentor_id: int,
        score: int,
        was_resolved: bool,
        comment: str | None = None,
    ) -> dict:
        query = """
            INSERT INTO ratings (match_id, mentor_id, score, was_resolved, comment)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, match_id, mentor_id, score, was_resolved, comment, created_at;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (match_id, mentor_id, score, was_resolved, comment))
            return cur.fetchone()

    @staticmethod
    def find_by_match_id(match_id: int) -> dict | None:
        query = """
            SELECT id, match_id, mentor_id, score, was_resolved, comment, created_at
            FROM ratings
            WHERE match_id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (match_id,))
            return cur.fetchone()

    @staticmethod
    def apply_gamification(mentor_id: int, added_points: int) -> None:
        query = """
            UPDATE mentor_profiles
            SET points = points + %s,
                mentorships_completed = mentorships_completed + 1,
                level = 1 + ((points + %s) / 50),
                average_rating = COALESCE(
                    (SELECT ROUND(AVG(score)::numeric, 1) FROM ratings WHERE mentor_id = %s),
                    5.0
                )
            WHERE user_id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (added_points, added_points, mentor_id, mentor_id))
