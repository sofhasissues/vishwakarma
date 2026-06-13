from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.db.session import get_db
from app.db.tables.tracker import TrackedItem
from app.db.tables.users import User
from app.models.tracker import TrackedItemUpdate, TrackedItemResponse, NotificationPreferences
from app.models.analysis import Roadmap
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/tracker", tags=["tracker"])


@router.post("/init/{user_id}")
async def init_tracker(
    user_id: str,
    roadmap: Roadmap,
    db: AsyncSession = Depends(get_db)
):
    """Seed tracker from roadmap. Called automatically after roadmap generation."""
    items = []
    for week in roadmap.weekly_plan:
        for resource in week.resources:
            item = TrackedItem(
                id=uuid.uuid4(),
                user_id=uuid.UUID(user_id),
                analysis_id=uuid.uuid4(),  # placeholder until analysis is persisted
                skill_name=week.focus,
                resource_url=resource.url,
                status="pending",
                progress_pct=0,
            )
            items.append(item)
            db.add(item)

    await db.commit()
    return {"message": f"Tracker initialized with {len(items)} items"}


@router.get("/{user_id}")
async def get_tracker(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get all tracked items for a user."""
    result = await db.execute(
        select(TrackedItem).where(TrackedItem.user_id == uuid.UUID(user_id))
    )
    items = result.scalars().all()
    return items


@router.patch("/{item_id}")
async def update_tracker_item(
    item_id: str,
    update_data: TrackedItemUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update status, progress, or deadline of a tracked item."""
    result = await db.execute(
        select(TrackedItem).where(TrackedItem.id == uuid.UUID(item_id))
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(404, "Item not found")

    if update_data.status is not None:
        if update_data.status not in ["pending", "in-progress", "completed"]:
            raise HTTPException(400, "Status must be pending, in-progress, or completed")
        item.status = update_data.status

    if update_data.progress_pct is not None:
        if not 0 <= update_data.progress_pct <= 100:
            raise HTTPException(400, "Progress must be between 0 and 100")
        item.progress_pct = update_data.progress_pct

    if update_data.deadline is not None:
        item.deadline = update_data.deadline

    item.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return item


@router.patch("/preferences/{user_id}")
async def update_notification_preferences(
    user_id: str,
    prefs: NotificationPreferences,
    db: AsyncSession = Depends(get_db)
):
    """Update user notification preferences."""
    result = await db.execute(
        select(User).where(User.id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(404, "User not found")

    user.notification_email = prefs.notification_email
    user.notification_sms = prefs.notification_sms
    user.notification_whatsapp = prefs.notification_whatsapp
    if prefs.phone_number:
        user.phone_number = prefs.phone_number

    await db.commit()
    return {"message": "Preferences updated"}
