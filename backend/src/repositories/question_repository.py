from database import get_db_connection


class QuestionRepository:
    @staticmethod
    def create(student_id: int, problem_description: str) -> dict:
        query = """
            INSERT INTO questions (student_id, problem_description, status)
            VALUES (%s, %s, 'pending')
            RETURNING id, student_id, problem_description, embedding, status, created_at;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (student_id, problem_description))
            return cur.fetchone()

    @staticmethod
    def find_by_id(question_id: int) -> dict | None:
        query = """
            SELECT id, student_id, problem_description, embedding, status, created_at
            FROM questions
            WHERE id = %s;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (question_id,))
            return cur.fetchone()

    @staticmethod
    def list_by_student_id(student_id: int) -> list[dict]:
        query = """
            SELECT id, student_id, problem_description, embedding, status, created_at
            FROM questions
            WHERE student_id = %s
            ORDER BY created_at DESC;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (student_id,))
            return cur.fetchall()

    @staticmethod
    def list_open_questions() -> list[dict]:
        query = """
            SELECT q.id, q.student_id, u.full_name AS student_name, u.course,
                   q.problem_description, q.status, q.created_at
            FROM questions q
            JOIN users u ON u.id = q.student_id
            WHERE q.status = 'pending'
            ORDER BY q.created_at ASC;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

    @staticmethod
    def update_status(question_id: int, status: str) -> dict | None:
        query = """
            UPDATE questions
            SET status = %s
            WHERE id = %s
            RETURNING id, student_id, problem_description, embedding, status, created_at;
        """
        with get_db_connection() as conn, conn.cursor() as cur:
            cur.execute(query, (status, question_id))
            return cur.fetchone()
