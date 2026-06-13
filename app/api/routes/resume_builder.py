from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agents.resume_builder import build_resume
import io
import json

router = APIRouter(prefix="/resume-builder", tags=["resume-builder"])


class BuildRequest(BaseModel):
    parsed_data: dict
    target_role: str
    skill_gaps: list = []


@router.post("/generate")
async def generate_resume(req: BuildRequest):
    try:
        result = build_resume(req.parsed_data, req.target_role, req.skill_gaps)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/generate-text")
async def generate_resume_text(req: BuildRequest):
    """Generate resume as plain text for copy-paste."""
    try:
        data = build_resume(req.parsed_data, req.target_role, req.skill_gaps)

        lines = []
        lines.append(data.get("full_name", "").upper())
        lines.append(f"{data.get('email', '')} | {data.get('phone', '')}")
        lines.append("")
        lines.append("SUMMARY")
        lines.append("-" * 40)
        lines.append(data.get("summary", ""))
        lines.append("")
        lines.append("SKILLS")
        lines.append("-" * 40)
        lines.append(", ".join(data.get("skills", [])))
        lines.append("")
        lines.append("EXPERIENCE")
        lines.append("-" * 40)
        for exp in data.get("experience", []):
            lines.append(f"{exp.get('role')} — {exp.get('company')} ({exp.get('duration')})")
            for b in exp.get("bullets", []):
                lines.append(f"  • {b}")
            lines.append("")
        lines.append("EDUCATION")
        lines.append("-" * 40)
        for edu in data.get("education", []):
            lines.append(f"{edu.get('degree')} — {edu.get('institution')} ({edu.get('year')})")
            if edu.get("cgpa"):
                lines.append(f"  CGPA: {edu.get('cgpa')}")
        lines.append("")
        lines.append("PROJECTS")
        lines.append("-" * 40)
        for proj in data.get("projects", []):
            lines.append(f"{proj.get('name')}: {proj.get('description')}")
            lines.append(f"  Technologies: {', '.join(proj.get('technologies', []))}")
        if data.get("certifications"):
            lines.append("")
            lines.append("CERTIFICATIONS")
            lines.append("-" * 40)
            for cert in data.get("certifications", []):
                lines.append(f"  • {cert}")

        return {"text": "\n".join(lines), "data": data}
    except Exception as e:
        raise HTTPException(500, str(e))
