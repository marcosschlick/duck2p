from datetime import datetime

from pydantic import BaseModel, Field


class MessageSendRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: int
    match_id: int
    sender_id: int | None = None
    sender_name: str
    content: str
    created_at: datetime | None = None
    is_mine: bool = False
