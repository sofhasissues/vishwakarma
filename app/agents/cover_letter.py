import json
from app.utils.groq_client import groq_chat


SYSTEM_PROMPT = """You are an expert cover letter writer for Indian job market.
Write a concise, compelling cover letter.

Return ONLY valid JSON:
{
  "subject": "string",
  "body": "full cover letter text with paragraphs separated by \\n\\n",
  "word_count": integer
}

Guidelines:
- 3 paragraphs: intro, skills match, closing
- Mention company name and role specifically
- Reference specific skills that match the JD
- Professional but warm tone
- Under 300 words"""


def generate_cover_letter(
    parsed_resume: dict,
    job_title: str,
    company: str,
    job_skills: list,
) -> dict:
    prompt = f"""
Candidate: {parsed_resume.get('full_name')}
Target: {job_title} at {company}
Candidate skills: {parsed_resume.get('skills', [])}
Job requires: {job_skills}
"""
    _raw = groq_chat(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1024,
        json_mode=True,
    )
    return json.loads(_raw)
