from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.db.session import get_db
from app.db.tables.users import User
from app.services.notifications import notify_user
import uuid

router = APIRouter(prefix="/notifications", tags=["notifications"])


class TestNotificationRequest(BaseModel):
    user_id: str
    channel: str = "email"  # email / sms / whatsapp


class PreferencesRequest(BaseModel):
    notification_email: bool = True
    notification_sms: bool = False
    notification_whatsapp: bool = False
    phone_number: str = None
    job_deadline: str = None  # ISO date string


@router.post("/test")
async def test_notification(req: TestNotificationRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uuid.UUID(req.user_id.strip())))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")

    sent = notify_user(
        email=user.email,
        phone=user.phone_number,
        subject="Vishwakarma — Test Notification",
        message=f"Hi {user.name}, this is a test notification from Vishwakarma.",
        via_email=req.channel == "email",
        via_sms=req.channel == "sms",
        via_whatsapp=req.channel == "whatsapp",
    )
    return {"sent": sent}


@router.patch("/preferences/{user_id}")
async def update_preferences(
    user_id: str,
    prefs: PreferencesRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id.strip())))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")

    user.notification_email = prefs.notification_email
    user.notification_sms = prefs.notification_sms
    user.notification_whatsapp = prefs.notification_whatsapp
    if prefs.phone_number:
        user.phone_number = prefs.phone_number
    if prefs.job_deadline:
        from datetime import datetime
        user.job_deadline = datetime.fromisoformat(prefs.job_deadline)

    await db.commit()
    return {"message": "Preferences updated"}


@router.get("/preferences/{user_id}")
async def get_preferences(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id.strip())))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "notification_email": user.notification_email,
        "notification_sms": user.notification_sms,
        "notification_whatsapp": user.notification_whatsapp,
        "phone_number": user.phone_number,
        "job_deadline": user.job_deadline,
    }
