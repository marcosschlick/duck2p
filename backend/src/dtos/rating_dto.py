from datetime import datetime

from pydantic import BaseModel, Field


class RatingCreateRequest(BaseModel):
    score: int = Field(..., ge=1, le=5)
    was_resolved: bool = True
    comment: str | None = None


class RatingResponse(BaseModel):
    id: int
    match_id: int
    mentor_id: int
    score: int
    was_resolved: bool
    comment: str | None = None
    created_at: datetime | None = None
