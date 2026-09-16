from dataclasses import dataclass


@dataclass
class MentorProfile:
    user_id: int
    contact: str
    skills: str
    embedding: str | None = None
    is_available: bool = True
    points: int = 0
    level: int = 1
    mentorships_completed: int = 0
    average_rating: float = 5.0
    status: str = "pending"
    approved_by: int | None = None
