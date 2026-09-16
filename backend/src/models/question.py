from dataclasses import dataclass
from datetime import datetime


@dataclass
class Question:
    student_id: int
    problem_description: str
    id: int | None = None
    embedding: str | None = None
    status: str = "pending"
    created_at: datetime | None = None
