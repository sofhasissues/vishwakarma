from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InterviewMessage(BaseModel):
    role: str        # "interviewer" or "candidate"
    content: str
    timestamp: datetime = None


class InterviewSession(BaseModel):
    session_id: str
    user_id: str
    round_type: str  # "technical" or "hr"
    target_role: str
    status: str      # "active" or "completed"
    messages: list[InterviewMessage] = []
    created_at: datetime = None


class InterviewFeedback(BaseModel):
    session_id: str
    round_type: str
    overall_score: int        # 1-10
    communication_score: int  # 1-10
    technical_score: int      # 1-10 (0 for HR round)
    strengths: list[str]
    improvements: list[str]
    recommendation: str       # "strong yes / yes / maybe / no"
    detailed_feedback: str
