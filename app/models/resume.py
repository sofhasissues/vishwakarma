from pydantic import BaseModel, field_validator
from typing import Optional, Any


class Education(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    cgpa: Optional[float] = None
    year_of_graduation: Optional[int] = None

    @field_validator("year_of_graduation", mode="before")
    @classmethod
    def parse_year(cls, v: Any) -> Optional[int]:
        if v is None:
            return None
        if isinstance(v, int):
            return v
        if isinstance(v, str):
            # extract 4-digit year from strings like "May 2028"
            import re
            match = re.search(r"\b(19|20)\d{2}\b", v)
            if match:
                return int(match.group())
        return None

    @field_validator("cgpa", mode="before")
    @classmethod
    def parse_cgpa(cls, v: Any) -> Optional[float]:
        if v is None:
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None


class Experience(BaseModel):
    company: str
    role: str
    duration_months: Optional[int] = None
    description: str
    skills_used: list[str] = []


class Project(BaseModel):
    name: str
    description: str
    skills_used: list[str] = []
    url: Optional[str] = None


class ParsedResume(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = []
    education: list[Education] = []
    experience: list[Experience] = []
    projects: list[Project] = []
    certifications: list[str] = []
    summary: Optional[str] = None
