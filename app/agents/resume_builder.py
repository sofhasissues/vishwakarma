import json
from app.utils.groq_client import groq_chat


SYSTEM_PROMPT = """You are an expert resume writer. Generate a complete ATS-optimized resume.

Return ONLY valid JSON:
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "summary": "3-4 sentence professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "bullets": ["achievement1", "achievement2"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string",
      "cgpa": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["tech1"]
    }
  ],
  "certifications": ["cert1"]
}

Make it ATS-friendly: use standard section headers, include keywords from the target role."""


def build_resume(parsed_data: dict, target_role: str, skill_gaps: list) -> dict:
    prompt = f"""
Target role: {target_role}
Current profile: {json.dumps(parsed_data, indent=2)}
Skills to emphasize (recently acquired): {skill_gaps}

Generate an ATS-optimized resume that highlights strengths and incorporates target role keywords.
"""
    _raw = groq_chat(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=4096,
        json_mode=True,
    )
    return json.loads(_raw)
