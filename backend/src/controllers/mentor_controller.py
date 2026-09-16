from typing import Annotated

from dtos.mentor_dto import (
    MentorApplicationItem,
    MentorApplyRequest,
    MentorLeaderboardItem,
    MentorProfileResponse,
    MentorStatusResponse,
)
from fastapi import APIRouter, Depends, status
from services.auth_service import get_current_user
from services.mentor_service import MentorService

router = APIRouter(prefix="/mentors", tags=["mentors"])


def get_mentor_service() -> MentorService:
    return MentorService()


MentorServiceDep = Annotated[MentorService, Depends(get_mentor_service)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]


@router.post(
    "/apply",
    response_model=MentorProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Solicitar candidatura para se tornar mentor",
)
def apply(
    data: MentorApplyRequest,
    current_user: CurrentUserDep,
    mentor_service: MentorServiceDep,
) -> MentorProfileResponse:
    return mentor_service.apply(user_id=current_user["id"], data=data)


@router.get(
    "/me",
    response_model=MentorStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Consultar status de mentoria do usuário logado",
)
def get_my_status(
    current_user: CurrentUserDep,
    mentor_service: MentorServiceDep,
) -> MentorStatusResponse:
    return mentor_service.get_my_status(user_id=current_user["id"])


@router.get(
    "/applications",
    response_model=list[MentorApplicationItem],
    status_code=status.HTTP_200_OK,
    summary="Listar candidaturas pendentes para mentoria",
)
def list_applications(
    current_user: CurrentUserDep,
    mentor_service: MentorServiceDep,
) -> list[MentorApplicationItem]:
    return mentor_service.list_applications(current_user_id=current_user["id"])


@router.patch(
    "/applications/{target_user_id}/approve",
    response_model=MentorProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Aprovar candidatura de um novo mentor",
)
def approve_application(
    target_user_id: int,
    current_user: CurrentUserDep,
    mentor_service: MentorServiceDep,
) -> MentorProfileResponse:
    return mentor_service.approve_application(
        current_user_id=current_user["id"], target_user_id=target_user_id
    )


@router.patch(
    "/applications/{target_user_id}/reject",
    response_model=MentorProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Rejeitar candidatura de mentor",
)
def reject_application(
    target_user_id: int,
    current_user: CurrentUserDep,
    mentor_service: MentorServiceDep,
) -> MentorProfileResponse:
    return mentor_service.reject_application(
        current_user_id=current_user["id"], target_user_id=target_user_id
    )


@router.get(
    "/leaderboard",
    response_model=list[MentorLeaderboardItem],
    status_code=status.HTTP_200_OK,
    summary="Listar ranking dos mentores da comunidade",
)
def get_leaderboard(
    mentor_service: MentorServiceDep,
) -> list[MentorLeaderboardItem]:
    return mentor_service.get_leaderboard()
