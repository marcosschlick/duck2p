from typing import Annotated

from dtos.auth_dto import LoginRequest, TokenResponse, UserRegisterRequest, UserResponse
from fastapi import APIRouter, Depends, status
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService()


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar novo usuário",
)
def register(
    data: UserRegisterRequest,
    auth_service: AuthServiceDep,
) -> UserResponse:
    return auth_service.register(data)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Autenticar usuário e obter token JWT",
)
def login(
    data: LoginRequest,
    auth_service: AuthServiceDep,
) -> TokenResponse:
    return auth_service.login(data)
