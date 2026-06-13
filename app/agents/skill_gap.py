import json
from app.utils.groq_client import groq_chat
from app.models.analysis import SkillGap, SkillGapReport
from app.models.resume import ParsedResume

SYSTEM_PROMPT = """You are a career advisor analyzing skill gaps between a candidate's resume and job market demands.

Given:
1. The candidate's current skills
2. Market skill frequency data (how often each skill appears in job listings)

Return ONLY valid JSON with this structure:
{
  "missing_skills": [
    {
      "skill": "string",
      "market_demand": integer,
      "priority": "high|medium|low",
      "reason": "string explaining why this skill matters"
    }
  ],
  "strong_skills": ["skill1", "skill2"],
  "summary": "2-3 sentence summary of the candidate's position in the market"
}

Priority rules:
- high: skill appears in >50% of JDs and candidate doesn't have it
- medium: skill appears in 20-50% of JDs
- low: skill appears in <20% of JDs

strong_skills: skills the candidate HAS that also appear frequently in market data.
Be specific and actionable in the reason field."""


def analyze_skill_gaps(
    parsed_resume: ParsedResume,
    market_skill_freq: dict[str, int],
    target_role: str,
    target_location: str,
    total_jds: int,
) -> SkillGapReport:
    candidate_skills = [s.lower() for s in parsed_resume.skills]

    prompt = f"""
Candidate skills: {parsed_resume.skills}

Market skill frequency (skill: number of JDs out of {total_jds} total):
{json.dumps(market_skill_freq, indent=2)}

Target role: {target_role}
Target location: {target_location}
Total JDs analyzed: {total_jds}
"""

    raw = groq_chat(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        json_mode=True,
    )

    data = json.loads(raw)

    missing = [SkillGap(**s) for s in data.get("missing_skills", [])]
    missing.sort(key=lambda x: {"high": 0, "medium": 1, "low": 2}[x.priority])

    return SkillGapReport(
        target_role=target_role,
        target_location=target_location,
        existing_skills=parsed_resume.skills,
        missing_skills=missing,
        strong_skills=data.get("strong_skills", []),
        summary=data.get("summary", ""),
    )
