from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TrackedItemCreate(BaseModel):
    skill_name: str
    resource_url: Optional[str] = None
    deadline: Optional[datetime] = None


class TrackedItemUpdate(BaseModel):
    status: Optional[str] = None      # pending / in-progress / completed
    progress_pct: Optional[int] = None
    deadline: Optional[datetime] = None


class TrackedItemResponse(BaseModel):
    id: str
    skill_name: str
    resource_url: Optional[str] = None
    status: str
    progress_pct: int
    deadline: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationPreferences(BaseModel):
    notification_email: bool = True
    notification_sms: bool = False
    notification_whatsapp: bool = False
    phone_number: Optional[str] = None
