from app.workers.celery_app import celery_app
from datetime import datetime, timezone, timedelta
import asyncio


@celery_app.task
def check_deadlines():
    """Daily task: check deadlines and fire notifications."""
    asyncio.run(_check_deadlines_async())


async def _check_deadlines_async():
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from sqlalchemy import select
    from app.db.tables.tracker import TrackedItem
    from app.db.tables.users import User
    from app.services.notifications import notify_user
    from app.config import settings

    engine = create_async_engine(settings.database_url)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    now = datetime.now(timezone.utc)
    three_days_later = now + timedelta(days=3)
    seven_days_later = now + timedelta(days=7)

    async with SessionLocal() as db:
        # Get all incomplete items with deadlines in next 3 days
        result = await db.execute(
            select(TrackedItem, User)
            .join(User, TrackedItem.user_id == User.id)
            .where(
                TrackedItem.deadline <= three_days_later,
                TrackedItem.deadline >= now,
                TrackedItem.status != "completed",
            )
        )
        rows = result.all()

        for item, user in rows:
            days_left = (item.deadline - now).days
            subject = f"Vishwakarma: '{item.skill_name}' due in {days_left} day(s)"
            message = (
                f"Hi {user.name},\n\n"
                f"Your learning milestone '{item.skill_name}' is due in {days_left} day(s).\n"
                f"Current progress: {item.progress_pct}%\n\n"
                f"Keep going — you're building toward your career goal.\n\n"
                f"— Vishwakarma"
            )
            notify_user(
                email=user.email,
                phone=user.phone_number,
                subject=subject,
                message=message,
                via_email=user.notification_email,
                via_sms=user.notification_sms,
                via_whatsapp=user.notification_whatsapp,
            )
            print(f"[NOTIFIED] {user.email} — {item.skill_name} due in {days_left}d")

        # Check job deadline (stored on user)
        job_deadline_result = await db.execute(
            select(User).where(
                User.job_deadline <= seven_days_later,
                User.job_deadline >= now,
            )
        )
        users_near_deadline = job_deadline_result.scalars().all()

        for user in users_near_deadline:
            days_left = (user.job_deadline - now).days
            subject = f"Vishwakarma: Job application deadline in {days_left} day(s)"
            message = (
                f"Hi {user.name},\n\n"
                f"Your job application deadline is {days_left} day(s) away.\n"
                f"Make sure your roadmap milestones are on track.\n\n"
                f"Head to Vishwakarma to check your progress.\n\n"
                f"— Vishwakarma"
            )
            notify_user(
                email=user.email,
                phone=user.phone_number,
                subject=subject,
                message=message,
                via_email=user.notification_email,
                via_sms=user.notification_sms,
                via_whatsapp=user.notification_whatsapp,
            )
            print(f"[JOB DEADLINE] {user.email} — {days_left}d left")

        # Check stuck progress (0% halfway to deadline)
        halfway_check = now + timedelta(days=1)
        stuck_result = await db.execute(
            select(TrackedItem, User)
            .join(User, TrackedItem.user_id == User.id)
            .where(
                TrackedItem.progress_pct == 0,
                TrackedItem.status == "pending",
                TrackedItem.deadline <= three_days_later,
            )
        )
        stuck_rows = stuck_result.all()

        for item, user in stuck_rows:
            subject = f"Vishwakarma: '{item.skill_name}' hasn't been started"
            message = (
                f"Hi {user.name},\n\n"
                f"'{item.skill_name}' is due soon but hasn't been started yet.\n"
                f"Even 30 minutes a day can make a difference.\n\n"
                f"— Vishwakarma"
            )
            notify_user(
                email=user.email,
                phone=user.phone_number,
                subject=subject,
                message=message,
                via_email=user.notification_email,
                via_sms=user.notification_sms,
                via_whatsapp=user.notification_whatsapp,
            )

    await engine.dispose()


@celery_app.task
def send_manual_notification(user_id: str, subject: str, message: str):
    """Send a one-off notification to a specific user."""
    asyncio.run(_send_manual_async(user_id, subject, message))


async def _send_manual_async(user_id: str, subject: str, message: str):
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from sqlalchemy import select
    from app.db.tables.users import User
    from app.services.notifications import notify_user
    from app.config import settings
    import uuid

    engine = create_async_engine(settings.database_url)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        if user:
            notify_user(
                email=user.email,
                phone=user.phone_number,
                subject=subject,
                message=message,
                via_email=user.notification_email,
                via_sms=user.notification_sms,
                via_whatsapp=user.notification_whatsapp,
            )
    await engine.dispose()
