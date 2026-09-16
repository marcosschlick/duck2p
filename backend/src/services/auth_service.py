import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from dtos.auth_dto import LoginRequest, TokenResponse, UserRegisterRequest, UserResponse
from fastapi import HTTPException, status
from models.user import User
from repositories.user_repository import UserRepository

JWT_SECRET = os.getenv(
    "JWT_SECRET", "duck2p_super_secret_jwt_key_at_least_32_bytes_long_2026"
)
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


class AuthService:
    def __init__(self, user_repo: UserRepository | None = None):
        self.user_repo = user_repo or UserRepository()

    def hash_password(self, password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    def create_access_token(self, user_id: int, email: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        payload = {
            "sub": str(user_id),
            "email": email,
            "exp": expire,
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def register(self, data: UserRegisterRequest) -> UserResponse:
        if self.user_repo.find_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="E-mail já cadastrado.",
            )

        if self.user_repo.find_by_student_id(data.student_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Matrícula já cadastrada.",
            )

        password_hash = self.hash_password(data.password)

        new_user = User(
            full_name=data.full_name,
            email=data.email,
            student_id=data.student_id,
            password_hash=password_hash,
            course=data.course,
        )

        created = self.user_repo.create(new_user)
        return UserResponse(**created)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.user_repo.find_by_email(data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas.",
            )

        if not self.verify_password(data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas.",
            )

        token = self.create_access_token(user_id=user["id"], email=user["email"])
        return TokenResponse(access_token=token, token_type="bearer")
