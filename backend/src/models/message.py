from dataclasses import dataclass
from datetime import datetime


@dataclass
class Message:
    match_id: int
    sender_id: int
    content: str
    id: int | None = None
    created_at: datetime | None = None
