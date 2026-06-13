import json
from app.utils.groq_client import groq_chat
from app.models.resume import ParsedResume


SYSTEM_PROMPT = """You are an expert resume parser.
Extract all information from the resume text and return it as a JSON object.

Return ONLY valid JSON with this exact structure, no markdown, no explanation:
{
  "full_name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "skills": ["skill1", "skill2"],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "cgpa": null,
      "year_of_graduation": null
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration_months": null,
      "description": "string",
      "skills_used": ["skill1"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "skills_used": ["skill1"],
      "url": null
    }
  ],
  "certifications": ["cert1"],
  "summary": "string or null"
}

Be thorough. Infer skills from project descriptions and experience even if not explicitly listed."""


def parse_resume(raw_text: str) -> ParsedResume:
    """Send raw resume text to Groq, get back structured ParsedResume."""
    _raw = groq_chat(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Parse this resume:\n\n{raw_text}"}
        ],
        temperature=0.1,
        max_tokens=4096,
        json_mode=True,
    )

    response_text = _raw
    data = json.loads(response_text)
    return ParsedResume(**data)
