import json
from app.utils.gemini import gemini_json
from app.models.job import JobDescription, MarketIntelReport
from app.services.scraper import scrape_all_platforms

EXTRACT_PROMPT = """You are a job market analyst. Given raw scraped text from job listing pages, extract job descriptions.

Return ONLY valid JSON:
{{
  "jobs": [
    {{
      "title": "string",
      "company": "string",
      "location": "string",
      "skills_required": ["skill1", "skill2"],
      "experience_required": "string or null",
      "source": "{source}",
      "url": null
    }}
  ]
}}

Content:
{content}"""


def extract_jobs_from_content(content: str, source: str) -> list[dict]:
    try:
        data = gemini_json(EXTRACT_PROMPT.format(source=source, content=content[:6000]))
        jobs = data.get("jobs", [])
        for job in jobs:
            job["source"] = source
        return jobs
    except Exception as e:
        print(f"Failed to extract jobs from {source}: {e}")
        return []


def compute_skill_frequency(jobs: list[dict]) -> dict[str, int]:
    freq = {}
    for job in jobs:
        for skill in job.get("skills_required", []):
            skill_lower = skill.lower().strip()
            freq[skill_lower] = freq.get(skill_lower, 0) + 1
    return dict(sorted(freq.items(), key=lambda x: x[1], reverse=True))


async def run_market_intel(role: str, location: str) -> MarketIntelReport:
    scraped = await scrape_all_platforms(role, location)
    all_jobs = []
    for item in scraped:
        jobs = extract_jobs_from_content(item["content"], item["source"])
        all_jobs.extend(jobs)

    skill_freq = compute_skill_frequency(all_jobs)
    top_skills = list(skill_freq.keys())[:20]

    job_objects = []
    for j in all_jobs:
        try:
            job_objects.append(JobDescription(**j))
        except Exception:
            pass

    return MarketIntelReport(
        role=role,
        location=location,
        total_jds_scraped=len(job_objects),
        skill_frequency=skill_freq,
        top_skills=top_skills,
        jobs=job_objects,
    )
