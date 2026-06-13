from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.db.tables.interview_history import InterviewHistory
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter(prefix="/history", tags=["history"])


class SaveInterviewRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: str
    round_type: str
    target_role: str
    overall_score: int
    communication_score: int
    technical_score: int
    recommendation: str
    transcript: list
    feedback: dict


@router.post("/interview")
async def save_interview(req: SaveInterviewRequest, db: AsyncSession = Depends(get_db)):
    record = InterviewHistory(
        id=uuid.uuid4(),
        user_id=req.user_id,
        session_id=req.session_id,
        round_type=req.round_type,
        target_role=req.target_role,
        overall_score=req.overall_score,
        communication_score=req.communication_score,
        technical_score=req.technical_score,
        recommendation=req.recommendation,
        transcript=req.transcript,
        feedback=req.feedback,
    )
    db.add(record)
    await db.commit()
    return {"message": "Saved"}


@router.get("/interview/{user_id}")
async def get_interview_history(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InterviewHistory)
        .where(InterviewHistory.user_id == user_id)
        .order_by(desc(InterviewHistory.created_at))
        .limit(20)
    )
    records = result.scalars().all()
    return records


@router.get("/interview/session/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InterviewHistory).where(InterviewHistory.session_id == session_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "Session not found")
    return record
