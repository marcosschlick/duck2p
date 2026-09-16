from pydantic import BaseModel


class MentorApplyRequest(BaseModel):
    contact: str
    skills: str


class MentorProfileResponse(BaseModel):
    user_id: int
    contact: str
    skills: str
    is_available: bool
    points: int
    level: int
    mentorships_completed: int
    average_rating: float
    status: str
    approved_by: int | None = None


class MentorApplicationItem(BaseModel):
    user_id: int
    full_name: str
    email: str
    student_id: str
    course: str
    contact: str
    skills: str
    status: str


class MentorStatusResponse(BaseModel):
    is_mentor: bool
    status: str
    profile: MentorProfileResponse | None = None
