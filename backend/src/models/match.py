from dataclasses import dataclass
from datetime import datetime


@dataclass
class Match:
    question_id: int
    mentor_id: int
    id: int | None = None
    similarity_score: float | None = None
    ai_briefing: str | None = None
    status: str = "active"
    first_response_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime | None = None
