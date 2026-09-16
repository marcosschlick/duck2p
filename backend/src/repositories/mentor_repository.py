from database import get_db_connection


class MentorRepository:
    @staticmethod
    def find_by_user_id(user_id: int) -> dict | None:
        query = """
            SELECT user_id, skills, embedding, is_available, points, level,
                   mentorships_completed, average_rating, status, approved_by
            FROM mentor_profiles
            WHERE user_id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (user_id,))
            return cur.fetchone()

    @staticmethod
    def count_approved() -> int:
        query = """
            SELECT COUNT(*) AS count
            FROM mentor_profiles
            WHERE status = 'approved';
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query)
            result = cur.fetchone()
            return result["count"] if result else 0

    @staticmethod
    def upsert_application(
        user_id: int,
        skills: str,
        embedding: str | None = None,
        status: str = "pending",
        approved_by: int | None = None,
    ) -> dict:
        query = """
            INSERT INTO mentor_profiles (user_id, skills, embedding, status, approved_by)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                skills = EXCLUDED.skills,
                embedding = COALESCE(EXCLUDED.embedding, mentor_profiles.embedding),
                status = EXCLUDED.status,
                approved_by = EXCLUDED.approved_by
            RETURNING user_id, skills, embedding, is_available, points, level,
                      mentorships_completed, average_rating, status, approved_by;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (user_id, skills, embedding, status, approved_by))
            return cur.fetchone()

    @staticmethod
    def list_pending_applications() -> list[dict]:
        query = """
            SELECT mp.user_id, u.full_name, u.email, u.student_id, u.course,
                   mp.skills, mp.status
            FROM mentor_profiles mp
            JOIN users u ON u.id = mp.user_id
            WHERE mp.status = 'pending'
            ORDER BY mp.user_id ASC;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

    @staticmethod
    def update_status(
        user_id: int, status: str, approved_by: int | None = None
    ) -> dict | None:
        query = """
            UPDATE mentor_profiles
            SET status = %s, approved_by = %s
            WHERE user_id = %s
            RETURNING user_id, skills, embedding, is_available, points, level,
                      mentorships_completed, average_rating, status, approved_by;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (status, approved_by, user_id))
            return cur.fetchone()

    @staticmethod
    def list_available_approved() -> list[dict]:
        query = """
            SELECT user_id, skills, embedding, is_available, points, level,
                   mentorships_completed, average_rating, status, approved_by
            FROM mentor_profiles
            WHERE status = 'approved' AND is_available = TRUE;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

    @staticmethod
    def update_skills_and_embedding(user_id: int, skills: str, embedding: str) -> None:
        query = """
            UPDATE mentor_profiles
            SET skills = %s, embedding = %s
            WHERE user_id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (skills, embedding, user_id))

    @staticmethod
    def list_leaderboard() -> list[dict]:
        query = """
            SELECT mp.user_id, u.full_name, u.course, mp.skills,
                   mp.points, mp.level, mp.mentorships_completed, mp.average_rating
            FROM mentor_profiles mp
            JOIN users u ON u.id = mp.user_id
            WHERE mp.status = 'approved'
            ORDER BY mp.points DESC, mp.level DESC, mp.mentorships_completed DESC, mp.average_rating DESC;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()
