from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.scraper import extract_text_from_file
from app.agents.resume_parser import parse_resume

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/parse")
async def parse_resume_route(
    file: UploadFile = File(...),
    target_role: str = "Software Engineer",
    target_location: str = "Bangalore",
):
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(400, "Only PDF and DOCX files are supported")

    file_bytes = await file.read()

    try:
        raw_text = extract_text_from_file(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(400, f"Could not extract text: {str(e)}")

    try:
        parsed = parse_resume(raw_text)
        return parsed
    except Exception as e:
        raise HTTPException(500, str(e))
