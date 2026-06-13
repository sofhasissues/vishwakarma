from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from app.agents.ats_checker import check_ats
from app.agents.resume_builder import build_resume
from app.agents.cover_letter import generate_cover_letter
from app.agents.job_matcher import match_all_jobs
from app.agents.cgpa_context import contextualize_cgpa
from app.services.scraper import extract_text_from_file

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


@router.post("/ats")
async def ats_check(
    file: UploadFile = File(...),
    target_role: str = "Software Engineer",
):
    file_bytes = await file.read()
    raw_text = extract_text_from_file(file_bytes, file.filename)
    result = check_ats(raw_text, target_role)
    return result


class ResumeBuildRequest(BaseModel):
    parsed_data: dict
    target_role: str
    skill_gaps: list = []


@router.post("/build-resume")
async def build_resume_route(req: ResumeBuildRequest):
    try:
        result = build_resume(req.parsed_data, req.target_role, req.skill_gaps)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


class CoverLetterRequest(BaseModel):
    parsed_resume: dict
    job_title: str
    company: str
    job_skills: list = []


@router.post("/cover-letter")
async def cover_letter_route(req: CoverLetterRequest):
    try:
        result = generate_cover_letter(
            req.parsed_resume, req.job_title, req.company, req.job_skills
        )
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


class JobMatchRequest(BaseModel):
    candidate_skills: list
    jobs: list


@router.post("/match-jobs")
async def match_jobs_route(req: JobMatchRequest):
    try:
        result = match_all_jobs(req.candidate_skills, req.jobs)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


class CGPARequest(BaseModel):
    cgpa: float
    institution: str
    target_role: str


@router.post("/cgpa-context")
async def cgpa_context_route(req: CGPARequest):
    try:
        result = contextualize_cgpa(req.cgpa, req.institution, req.target_role)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))
