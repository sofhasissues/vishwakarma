from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.quiz import generate_quiz, score_quiz

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/generate")
async def get_quiz(skill: str, target_role: str = "Software Engineer"):
    try:
        return generate_quiz(skill, target_role)
    except Exception as e:
        raise HTTPException(500, str(e))


class ScoreRequest(BaseModel):
    questions: list
    answers: dict


@router.post("/score")
async def score(req: ScoreRequest):
    try:
        return score_quiz(req.questions, req.answers)
    except Exception as e:
        raise HTTPException(500, str(e))
