from pydantic import BaseModel
from typing import Optional


class JobDescription(BaseModel):
    title: str
    company: str
    location: str
    skills_required: list[str] = []
    experience_required: Optional[str] = None
    source: str  # linkedin / naukri / internshala / wellfound
    url: Optional[str] = None


class MarketIntelReport(BaseModel):
    role: str
    location: str
    total_jds_scraped: int
    skill_frequency: dict[str, int]  # skill -> count across all JDs
    top_skills: list[str]            # top 20 by frequency
    jobs: list[JobDescription] = []
