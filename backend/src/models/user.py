from dataclasses import dataclass
from datetime import datetime


@dataclass
class User:
    full_name: str
    email: str
    student_id: str
    password_hash: str
    course: str
    id: int | None = None
    created_at: datetime | None = None
