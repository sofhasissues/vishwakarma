from app.utils.gemini import gemini_json

PROMPT = """You are an ATS (Applicant Tracking System) expert.
Analyze this resume for ATS compatibility for the role: {role}

Return ONLY valid JSON:
{{
  "ats_score": integer 0-100,
  "missing_keywords": ["keyword1", "keyword2"],
  "formatting_issues": ["issue1", "issue2"],
  "suggested_fixes": ["fix1", "fix2"],
  "strong_points": ["point1", "point2"],
  "summary": "2-3 sentence summary"
}}

Resume:
{resume}"""


def check_ats(raw_text: str, target_role: str) -> dict:
    return gemini_json(PROMPT.format(role=target_role, resume=raw_text[:5000]))
