from app.utils.gemini import gemini_json

PROMPT = """You are a job matching expert.

Candidate skills: {skills}
Job title: {title}
Company: {company}
Required skills: {required}
Experience required: {exp}

Return ONLY valid JSON:
{{
  "match_score": integer 0-100,
  "matching_skills": ["skill1"],
  "missing_skills": ["skill1"],
  "verdict": "can_get_now|after_roadmap|out_of_reach",
  "reason": "one sentence explanation"
}}

Verdict: can_get_now >= 70, after_roadmap 40-69, out_of_reach < 40"""


def match_job(candidate_skills: list, job: dict) -> dict:
    try:
        result = gemini_json(PROMPT.format(
            skills=candidate_skills,
            title=job.get("title"),
            company=job.get("company"),
            required=job.get("skills_required", []),
            exp=job.get("experience_required", "Not specified"),
        ))
        return {**job, **result}
    except Exception:
        return {**job, "match_score": 0, "verdict": "out_of_reach", "matching_skills": [], "missing_skills": [], "reason": "Could not analyze"}


def match_all_jobs(candidate_skills: list, jobs: list) -> dict:
    matched = [match_job(candidate_skills, job) for job in jobs[:15]]
    return {
        "can_get_now": [j for j in matched if j.get("verdict") == "can_get_now"],
        "after_roadmap": [j for j in matched if j.get("verdict") == "after_roadmap"],
        "out_of_reach": [j for j in matched if j.get("verdict") == "out_of_reach"],
    }
