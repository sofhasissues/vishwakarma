from pydantic import BaseModel
from typing import Optional


class SkillGap(BaseModel):
    skill: str
    market_demand: int
    priority: str
    reason: str


class SkillGapReport(BaseModel):
    target_role: str
    target_location: str
    existing_skills: list[str]
    missing_skills: list[SkillGap]
    strong_skills: list[str]
    summary: str


class Resource(BaseModel):
    title: str
    url: Optional[str] = None
    type: str  # course / video / article / project


class WeekPlan(BaseModel):
    week: int
    focus: str
    tasks: list[str]
    resources: list[Resource]
    deliverable: str  # what should be built/completed by end of week


class Roadmap(BaseModel):
    target_role: str
    target_location: str
    total_weeks: int
    weekly_plan: list[WeekPlan]
    summary: str
