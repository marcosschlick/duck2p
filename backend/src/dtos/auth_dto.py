from datetime import datetime

from pydantic import BaseModel


class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    student_id: str
    course: str
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    student_id: str
    course: str
    created_at: datetime | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
