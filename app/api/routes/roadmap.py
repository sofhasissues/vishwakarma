from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from app.agents.resume_parser import parse_resume
from app.agents.market_intel import run_market_intel
from app.agents.skill_gap import analyze_skill_gaps
from app.agents.roadmap import build_roadmap
from app.models.analysis import SkillGap
from app.services.scraper import extract_text_from_file

router = APIRouter(prefix="/roadmap", tags=["roadmap"])


class RoadmapFromGapsRequest(BaseModel):
    skill_gaps: list[dict]
    existing_skills: list[str]
    target_role: str
    target_location: str


@router.post("/from-gaps")
async def roadmap_from_gaps(req: RoadmapFromGapsRequest):
    """Build roadmap directly from pre-computed gaps. No scraping."""
    try:
        gaps = [SkillGap(**g) for g in req.skill_gaps]
        roadmap = build_roadmap(
            skill_gaps=gaps,
            target_role=req.target_role,
            target_location=req.target_location,
            existing_skills=req.existing_skills,
        )
        return roadmap
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/generate")
async def generate_roadmap(
    file: UploadFile = File(...),
    target_role: str = "Data Analyst",
    target_location: str = "Bangalore",
):
    file_bytes = await file.read()
    raw_text = extract_text_from_file(file_bytes, file.filename)
    parsed = parse_resume(raw_text)
    market = await run_market_intel(target_role, target_location)
    gap_report = analyze_skill_gaps(
        parsed_resume=parsed,
        market_skill_freq=market.skill_frequency,
        target_role=target_role,
        target_location=target_location,
        total_jds=market.total_jds_scraped,
    )
    roadmap = build_roadmap(
        skill_gaps=gap_report.missing_skills,
        target_role=target_role,
        target_location=target_location,
        existing_skills=parsed.skills,
    )
    return roadmap
