from sqlalchemy import Column, String, DateTime, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from app.db.base import Base


class InterviewHistory(Base):
    __tablename__ = "interview_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=True, index=True)
    session_id = Column(String, nullable=False, unique=True)
    round_type = Column(String, nullable=False)
    target_role = Column(String, nullable=False)
    overall_score = Column(Integer, nullable=True)
    communication_score = Column(Integer, nullable=True)
    technical_score = Column(Integer, nullable=True)
    recommendation = Column(String, nullable=True)
    transcript = Column(JSON, nullable=True)
    feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
