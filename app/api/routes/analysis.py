from fastapi import APIRouter, HTTPException, UploadFile, File
from app.agents.market_intel import run_market_intel
from app.agents.skill_gap import analyze_skill_gaps
from app.agents.resume_parser import parse_resume
from app.services.scraper import extract_text_from_file

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/market")
async def get_market_skills(
    role: str = "Software Engineer",
    location: str = "Bangalore"
):
    try:
        report = await run_market_intel(role, location)
        return report
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/gaps")
async def get_skill_gaps(
    file: UploadFile = File(...),
    target_role: str = "Data Analyst",
    target_location: str = "Bangalore",
):
    file_bytes = await file.read()
    raw_text = extract_text_from_file(file_bytes, file.filename)
    parsed = parse_resume(raw_text)
    market = await run_market_intel(target_role, target_location)

    report = analyze_skill_gaps(
        parsed_resume=parsed,
        market_skill_freq=market.skill_frequency,
        target_role=target_role,
        target_location=target_location,
        total_jds=market.total_jds_scraped,
    )
    return report
