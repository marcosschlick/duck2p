from datetime import datetime

from pydantic import BaseModel


class MatchResponse(BaseModel):
    id: int
    question_id: int
    mentor_id: int
    similarity_score: float | None = None
    ai_briefing: str | None = None
    status: str
    first_response_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime | None = None


class MatchDetailResponse(BaseModel):
    id: int
    question_id: int
    problem_description: str
    student_id: int
    student_name: str
    mentor_id: int
    mentor_name: str
    similarity_score: float | None = None
    ai_briefing: str | None = None
    status: str
    first_response_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime | None = None
