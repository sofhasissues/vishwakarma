import json
from app.utils.groq_client import groq_chat


SYSTEM_PROMPT = """You are an Indian academic and career expert.
Analyze a student's CGPA in context of their institution and target role.

Return ONLY valid JSON:
{
  "cgpa_percentile": "top X% of applicants",
  "institution_tier": "Tier 1|Tier 2|Tier 3",
  "market_context": "how employers view this CGPA",
  "cgpa_verdict": "strong|acceptable|weak",
  "advice": "one specific actionable advice"
}"""


def contextualize_cgpa(cgpa: float, institution: str, target_role: str) -> dict:
    prompt = f"""
CGPA: {cgpa}
Institution: {institution}
Target role: {target_role}
"""
    try:
        _raw = groq_chat(
                messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=512,
            json_mode=True,
        )
        return json.loads(_raw)
    except Exception:
        return {}
