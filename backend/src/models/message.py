from dataclasses import dataclass
from datetime import datetime


@dataclass
class Message:
    match_id: int
    content: str
    sender_id: int | None = None
    id: int | None = None
    created_at: datetime | None = None
