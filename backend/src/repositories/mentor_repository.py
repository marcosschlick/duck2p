from database import get_db_connection


class MentorRepository:
    @staticmethod
    def find_by_user_id(user_id: int) -> dict | None:
        query = """
            SELECT user_id, contact, skills, embedding, is_available, points, level,
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
        contact: str,
        skills: str,
        status: str = "pending",
        approved_by: int | None = None,
    ) -> dict:
        query = """
            INSERT INTO mentor_profiles (user_id, contact, skills, status, approved_by)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                contact = EXCLUDED.contact,
                skills = EXCLUDED.skills,
                status = EXCLUDED.status,
                approved_by = EXCLUDED.approved_by
            RETURNING user_id, contact, skills, embedding, is_available, points, level,
                      mentorships_completed, average_rating, status, approved_by;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (user_id, contact, skills, status, approved_by))
            return cur.fetchone()

    @staticmethod
    def list_pending_applications() -> list[dict]:
        query = """
            SELECT mp.user_id, u.full_name, u.email, u.student_id, u.course,
                   mp.contact, mp.skills, mp.status
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
            RETURNING user_id, contact, skills, embedding, is_available, points, level,
                      mentorships_completed, average_rating, status, approved_by;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (status, approved_by, user_id))
            return cur.fetchone()
