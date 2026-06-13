from typing import TypedDict, Optional
from app.models.resume import ParsedResume


class VishwakarmaState(TypedDict):
    # Input
    resume_raw: str
    target_role: str
    target_location: str
    user_id: str
    resume_id: str

    # ResumeParserAgent output
    parsed_resume: Optional[ParsedResume]

    # MarketIntelAgent output (Phase 3)
    live_jds: Optional[list]
    market_skill_freq: Optional[dict]

    # SkillGapAgent output (Phase 4)
    skill_gaps: Optional[list]

    # RoadmapAgent output (Phase 5)
    roadmap: Optional[dict]

    # MockInterviewAgent (Phase 6)
    interview_history: Optional[list]
    interview_feedback: Optional[dict]

    # Errors
    error: Optional[str]
