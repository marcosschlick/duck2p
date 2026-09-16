from typing import Annotated

from dtos.match_dto import MatchResponse
from dtos.question_dto import (
    QuestionCreateRequest,
    QuestionOpenItem,
    QuestionResponse,
)
from fastapi import APIRouter, Depends, status
from services.auth_service import get_current_user
from services.match_service import MatchService
from services.question_service import QuestionService

router = APIRouter(prefix="/questions", tags=["questions"])


def get_question_service() -> QuestionService:
    return QuestionService()


def get_match_service() -> MatchService:
    return MatchService()


QuestionServiceDep = Annotated[QuestionService, Depends(get_question_service)]
MatchServiceDep = Annotated[MatchService, Depends(get_match_service)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]


@router.post(
    "",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submeter nova dúvida de programação",
)
def create_question(
    data: QuestionCreateRequest,
    current_user: CurrentUserDep,
    question_service: QuestionServiceDep,
) -> QuestionResponse:
    return question_service.create_question(student_id=current_user["id"], data=data)


@router.get(
    "/me",
    response_model=list[QuestionResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar dúvidas abertas pelo usuário logado",
)
def list_my_questions(
    current_user: CurrentUserDep,
    question_service: QuestionServiceDep,
) -> list[QuestionResponse]:
    return question_service.list_my_questions(student_id=current_user["id"])


@router.get(
    "/open",
    response_model=list[QuestionOpenItem],
    status_code=status.HTTP_200_OK,
    summary="Listar dúvidas abertas aguardando mentor",
)
def list_open_questions(
    current_user: CurrentUserDep,
    question_service: QuestionServiceDep,
) -> list[QuestionOpenItem]:
    return question_service.list_open_questions(current_user_id=current_user["id"])


@router.post(
    "/{question_id}/accept",
    response_model=MatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Aceitar atender uma dúvida como mentor",
)
def accept_question(
    question_id: int,
    current_user: CurrentUserDep,
    match_service: MatchServiceDep,
) -> MatchResponse:
    return match_service.accept_question(
        mentor_id=current_user["id"], question_id=question_id
    )
