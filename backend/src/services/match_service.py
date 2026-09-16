import json

from dtos.match_dto import MatchDetailResponse, MatchResponse
from dtos.rating_dto import RatingCreateRequest, RatingResponse
from fastapi import HTTPException, status
from repositories.match_repository import MatchRepository
from repositories.mentor_repository import MentorRepository
from repositories.message_repository import MessageRepository
from repositories.question_repository import QuestionRepository
from repositories.rating_repository import RatingRepository
from services.ai_service import AIService


class MatchService:
    def __init__(
        self,
        match_repo: MatchRepository | None = None,
        question_repo: QuestionRepository | None = None,
        mentor_repo: MentorRepository | None = None,
        rating_repo: RatingRepository | None = None,
        message_repo: MessageRepository | None = None,
        ai_service: AIService | None = None,
    ):
        self.match_repo = match_repo or MatchRepository()
        self.question_repo = question_repo or QuestionRepository()
        self.mentor_repo = mentor_repo or MentorRepository()
        self.rating_repo = rating_repo or RatingRepository()
        self.message_repo = message_repo or MessageRepository()
        self.ai_service = ai_service or AIService()

    def create_match_with_ai(
        self, question_id: int, mentor_id: int, similarity_score: float
    ) -> MatchResponse:
        question = self.question_repo.find_by_id(question_id)
        problem_desc = question["problem_description"] if question else ""
        briefing = self.ai_service.generate_mentor_briefing(problem_desc)
        match = self.match_repo.create(
            question_id=question_id,
            mentor_id=mentor_id,
            similarity_score=similarity_score,
            ai_briefing=briefing,
        )
        self.question_repo.update_status(question_id, "matched")
        duck_greeting = self.ai_service.generate_duck_bot_greeting(problem_desc)
        self.message_repo.create(
            match_id=match["id"],
            sender_id=None,
            content=duck_greeting,
        )
        return MatchResponse(**match)

    def accept_question(self, mentor_id: int, question_id: int) -> MatchResponse:
        mentor = self.mentor_repo.find_by_user_id(mentor_id)
        if not mentor or mentor["status"] != "approved":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas mentores aprovados podem aceitar dúvidas.",
            )

        question = self.question_repo.find_by_id(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dúvida não encontrada.",
            )

        if question["student_id"] == mentor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você não pode aceitar atender sua própria dúvida.",
            )

        if question["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esta dúvida já foi aceita ou resolvida.",
            )

        score = 1.0
        if question.get("embedding") and mentor.get("embedding"):
            try:
                q_vec = json.loads(question["embedding"])
                m_vec = json.loads(mentor["embedding"])
                score = round(
                    self.ai_service.calculate_cosine_similarity(q_vec, m_vec), 4
                )
            except (json.JSONDecodeError, TypeError, ValueError):
                score = 1.0

        return self.create_match_with_ai(
            question_id=question_id, mentor_id=mentor_id, similarity_score=score
        )

    def get_match_detail(self, user_id: int, match_id: int) -> MatchDetailResponse:
        detail = self.match_repo.find_detail_by_id(match_id)
        if not detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atendimento não encontrado.",
            )

        if detail["student_id"] != user_id and detail["mentor_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar este atendimento.",
            )

        return MatchDetailResponse(**detail)

    def list_active_matches(self, user_id: int) -> list[MatchDetailResponse]:
        rows = self.match_repo.list_active_by_user_id(user_id)
        return [MatchDetailResponse(**row) for row in rows]

    def rate_and_complete(
        self, student_id: int, match_id: int, data: RatingCreateRequest
    ) -> RatingResponse:
        match = self.match_repo.find_by_id(match_id)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atendimento não encontrado.",
            )

        question = self.question_repo.find_by_id(match["question_id"])
        if not question or question["student_id"] != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas o estudante autor da dúvida pode avaliar e concluir a mentoria.",
            )

        if match["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este atendimento já foi finalizado.",
            )

        if self.rating_repo.find_by_match_id(match_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este atendimento já foi avaliado.",
            )

        rating = self.rating_repo.create(
            match_id=match_id,
            mentor_id=match["mentor_id"],
            score=data.score,
            was_resolved=data.was_resolved,
            comment=data.comment,
        )

        self.match_repo.complete_match(match_id)
        self.question_repo.update_status(match["question_id"], "resolved")

        base_points = 10 if data.was_resolved else 2
        bonus_points = 5 if data.score == 5 else 0
        total_points = base_points + bonus_points

        self.rating_repo.apply_gamification(
            mentor_id=match["mentor_id"], added_points=total_points
        )

        if data.was_resolved:
            mentor_profile = self.mentor_repo.find_by_user_id(match["mentor_id"])
            if mentor_profile:
                knowledge_context = (
                    f"{mentor_profile['skills']} {question['problem_description'].strip()}"
                )
                new_embedding = self.ai_service.generate_embedding_json(
                    knowledge_context
                )
                self.mentor_repo.update_embedding(
                    user_id=match["mentor_id"],
                    embedding=new_embedding,
                )

        return RatingResponse(**rating)
