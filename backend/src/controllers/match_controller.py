from typing import Annotated

from dtos.match_dto import MatchDetailResponse
from dtos.message_dto import MessageResponse, MessageSendRequest
from dtos.rating_dto import RatingCreateRequest, RatingResponse
from fastapi import APIRouter, Depends, status
from services.auth_service import get_current_user
from services.chat_service import ChatService
from services.match_service import MatchService

router = APIRouter(prefix="/matches", tags=["matches"])


def get_match_service() -> MatchService:
    return MatchService()


def get_chat_service() -> ChatService:
    return ChatService()


MatchServiceDep = Annotated[MatchService, Depends(get_match_service)]
ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]


@router.get(
    "/my-active",
    response_model=list[MatchDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar atendimentos ativos do usuário logado",
)
def list_my_active_matches(
    current_user: CurrentUserDep,
    match_service: MatchServiceDep,
) -> list[MatchDetailResponse]:
    return match_service.list_active_matches(user_id=current_user["id"])


@router.get(
    "/{match_id}",
    response_model=MatchDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Obter detalhes de uma sessão de atendimento",
)
def get_match_detail(
    match_id: int,
    current_user: CurrentUserDep,
    match_service: MatchServiceDep,
) -> MatchDetailResponse:
    return match_service.get_match_detail(user_id=current_user["id"], match_id=match_id)


@router.post(
    "/{match_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enviar mensagem na sessão de mentoria",
)
def send_message(
    match_id: int,
    data: MessageSendRequest,
    current_user: CurrentUserDep,
    chat_service: ChatServiceDep,
) -> MessageResponse:
    return chat_service.send_message(
        user_id=current_user["id"], match_id=match_id, data=data
    )


@router.get(
    "/{match_id}/messages",
    response_model=list[MessageResponse],
    status_code=status.HTTP_200_OK,
    summary="Listar mensagens trocadas no atendimento",
)
def list_messages(
    match_id: int,
    current_user: CurrentUserDep,
    chat_service: ChatServiceDep,
) -> list[MessageResponse]:
    return chat_service.list_messages(user_id=current_user["id"], match_id=match_id)


@router.post(
    "/{match_id}/rate",
    response_model=RatingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Avaliar e concluir o atendimento de mentoria",
)
def rate_and_complete(
    match_id: int,
    data: RatingCreateRequest,
    current_user: CurrentUserDep,
    match_service: MatchServiceDep,
) -> RatingResponse:
    return match_service.rate_and_complete(
        student_id=current_user["id"], match_id=match_id, data=data
    )
