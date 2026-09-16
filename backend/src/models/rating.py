from dataclasses import dataclass
from datetime import datetime


@dataclass
class Rating:
    match_id: int
    mentor_id: int
    score: int
    id: int | None = None
    was_resolved: bool = True
    comment: str | None = None
    created_at: datetime | None = None
