from dtos.mentor_dto import (
    MentorApplicationItem,
    MentorApplyRequest,
    MentorLeaderboardItem,
    MentorProfileResponse,
    MentorStatusResponse,
)
from fastapi import HTTPException, status
from repositories.mentor_repository import MentorRepository
from services.ai_service import AIService


class MentorService:
    def __init__(
        self,
        mentor_repo: MentorRepository | None = None,
        ai_service: AIService | None = None,
    ):
        self.mentor_repo = mentor_repo or MentorRepository()
        self.ai_service = ai_service or AIService()

    def apply(self, user_id: int, data: MentorApplyRequest) -> MentorProfileResponse:
        embedding = self.ai_service.generate_embedding_json(data.skills)
        result = self.mentor_repo.upsert_application(
            user_id=user_id,
            skills=data.skills,
            embedding=embedding,
            status="approved",
            approved_by=user_id,
        )
        return MentorProfileResponse(**result)

    def get_my_status(self, user_id: int) -> MentorStatusResponse:
        profile = self.mentor_repo.find_by_user_id(user_id)
        if not profile:
            return MentorStatusResponse(is_mentor=False, status="none", profile=None)

        is_mentor = profile["status"] == "approved"
        return MentorStatusResponse(
            is_mentor=is_mentor,
            status=profile["status"],
            profile=MentorProfileResponse(**profile),
        )

    def list_applications(self, current_user_id: int) -> list[MentorApplicationItem]:
        profile = self.mentor_repo.find_by_user_id(current_user_id)
        if not profile or profile["status"] != "approved":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso restrito a mentores aprovados.",
            )

        rows = self.mentor_repo.list_pending_applications()
        return [MentorApplicationItem(**row) for row in rows]

    def approve_application(
        self, current_user_id: int, target_user_id: int
    ) -> MentorProfileResponse:
        profile = self.mentor_repo.find_by_user_id(current_user_id)
        if not profile or profile["status"] != "approved":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso restrito a mentores aprovados.",
            )

        if current_user_id == target_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é permitido aprovar a própria candidatura.",
            )

        target_profile = self.mentor_repo.find_by_user_id(target_user_id)
        if not target_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidatura não encontrada.",
            )

        if target_profile["status"] == "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Candidato já está aprovado.",
            )

        updated = self.mentor_repo.update_status(
            target_user_id, status="approved", approved_by=current_user_id
        )
        return MentorProfileResponse(**updated)

    def reject_application(
        self, current_user_id: int, target_user_id: int
    ) -> MentorProfileResponse:
        profile = self.mentor_repo.find_by_user_id(current_user_id)
        if not profile or profile["status"] != "approved":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso restrito a mentores aprovados.",
            )

        target_profile = self.mentor_repo.find_by_user_id(target_user_id)
        if not target_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidatura não encontrada.",
            )

        updated = self.mentor_repo.update_status(
            target_user_id, status="rejected", approved_by=current_user_id
        )
        return MentorProfileResponse(**updated)

    def get_leaderboard(self) -> list[MentorLeaderboardItem]:
        rows = self.mentor_repo.list_leaderboard()
        return [MentorLeaderboardItem(**row) for row in rows]
