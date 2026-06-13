from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)  # null for OAuth users
    target_role = Column(String, nullable=True)
    target_location = Column(String, nullable=True)
    job_deadline = Column(DateTime(timezone=True), nullable=True)
    notification_email = Column(Boolean, default=True)
    notification_sms = Column(Boolean, default=False)
    notification_whatsapp = Column(Boolean, default=False)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
