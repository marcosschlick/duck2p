from datetime import datetime

from pydantic import BaseModel, Field


class QuestionCreateRequest(BaseModel):
    problem_description: str = Field(..., min_length=10, max_length=2000)


class QuestionResponse(BaseModel):
    id: int
    student_id: int
    problem_description: str
    status: str
    created_at: datetime | None = None
    match_id: int | None = None


class QuestionOpenItem(BaseModel):
    id: int
    student_id: int
    student_name: str
    course: str
    problem_description: str
    status: str
    created_at: datetime | None = None
