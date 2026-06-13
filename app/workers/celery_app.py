from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "vishwakarma",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.workers.tasks"]
)

celery_app.conf.beat_schedule = {
    "check-deadlines-daily": {
        "task": "app.workers.tasks.check_deadlines",
        "schedule": crontab(hour=9, minute=0),  # runs every day at 9am
    }
}

celery_app.conf.timezone = "Asia/Kolkata"
