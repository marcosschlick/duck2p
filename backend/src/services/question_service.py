import json

from dtos.question_dto import (
    QuestionCreateRequest,
    QuestionOpenItem,
    QuestionResponse,
)
from fastapi import HTTPException, status
from repositories.mentor_repository import MentorRepository
from repositories.question_repository import QuestionRepository
from services.ai_service import AIService
from services.match_service import MatchService


class QuestionService:
    def __init__(
        self,
        question_repo: QuestionRepository | None = None,
        mentor_repo: MentorRepository | None = None,
        match_service: MatchService | None = None,
        ai_service: AIService | None = None,
    ):
        self.question_repo = question_repo or QuestionRepository()
        self.mentor_repo = mentor_repo or MentorRepository()
        self.match_service = match_service or MatchService()
        self.ai_service = ai_service or AIService()

    def create_question(
        self, student_id: int, data: QuestionCreateRequest
    ) -> QuestionResponse:
        embedding_json = self.ai_service.generate_embedding_json(
            data.problem_description
        )
        created = self.question_repo.create(
            student_id=student_id,
            problem_description=data.problem_description,
            embedding=embedding_json,
        )

        embedding_vec = json.loads(embedding_json)
        available_mentors = self.mentor_repo.list_available_approved()
        candidate_mentors = [m for m in available_mentors if m["user_id"] != student_id]

        match_id = None
        if candidate_mentors:
            best_match = self.ai_service.find_best_mentor(
                embedding_vec, candidate_mentors
            )
            if best_match:
                best_mentor, score = best_match
                match_res = self.match_service.create_match_with_ai(
                    question_id=created["id"],
                    mentor_id=best_mentor["user_id"],
                    similarity_score=score,
                )
                created["status"] = "matched"
                match_id = match_res.id

        return QuestionResponse(
            id=created["id"],
            student_id=created["student_id"],
            problem_description=created["problem_description"],
            status=created["status"],
            created_at=created.get("created_at"),
            match_id=match_id,
        )

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
