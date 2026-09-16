from dtos.question_dto import (
    QuestionCreateRequest,
    QuestionOpenItem,
    QuestionResponse,
)
from fastapi import HTTPException, status
from repositories.mentor_repository import MentorRepository
from repositories.question_repository import QuestionRepository


class QuestionService:
    def __init__(
        self,
        question_repo: QuestionRepository | None = None,
        mentor_repo: MentorRepository | None = None,
    ):
        self.question_repo = question_repo or QuestionRepository()
        self.mentor_repo = mentor_repo or MentorRepository()

    def create_question(
        self, student_id: int, data: QuestionCreateRequest
    ) -> QuestionResponse:
        created = self.question_repo.create(
            student_id=student_id, problem_description=data.problem_description
        )
        return QuestionResponse(**created)

    def list_my_questions(self, student_id: int) -> list[QuestionResponse]:
        rows = self.question_repo.list_by_student_id(student_id)
        return [QuestionResponse(**row) for row in rows]

    def list_open_questions(self, current_user_id: int) -> list[QuestionOpenItem]:
        mentor = self.mentor_repo.find_by_user_id(current_user_id)
        if not mentor or mentor["status"] != "approved":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas mentores aprovados podem visualizar dúvidas abertas.",
            )
        rows = self.question_repo.list_open_questions()
        return [QuestionOpenItem(**row) for row in rows]

    def get_question_by_id(self, question_id: int) -> QuestionResponse:
        question = self.question_repo.find_by_id(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dúvida não encontrada.",
            )
        return QuestionResponse(**question)
