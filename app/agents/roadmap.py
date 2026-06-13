import json
from app.utils.groq_client import groq_chat
from app.models.analysis import SkillGap, Roadmap, WeekPlan, Resource


SYSTEM_PROMPT = """You are a career coach building a personalized learning roadmap.

Given a candidate's skill gaps and target role, create a week-by-week learning plan.

Return ONLY valid JSON with this structure:
{
  "total_weeks": integer,
  "weekly_plan": [
    {
      "week": 1,
      "focus": "string - what skill this week targets",
      "tasks": ["task1", "task2", "task3"],
      "resources": [
        {
          "title": "string",
          "url": "string or null",
          "type": "course|video|article|project"
        }
      ],
      "deliverable": "string - concrete output by end of week"
    }
  ],
  "summary": "2-3 sentence overview of the roadmap"
}

Rules:
- Focus on HIGH priority gaps first, then medium, then low
- Each week should have 3-5 tasks
- Each week should have 2-3 resources with real, specific names
- Deliverable must be concrete and measurable
- Total weeks should be realistic (4-12 weeks depending on number of gaps)
- Resources should include free options like YouTube, freeCodeCamp, Kaggle, etc."""


def build_roadmap(
    skill_gaps: list[SkillGap],
    target_role: str,
    target_location: str,
    existing_skills: list[str],
) -> Roadmap:
    gaps_text = json.dumps([g.model_dump() for g in skill_gaps], indent=2)

    prompt = f"""
Target role: {target_role}
Target location: {target_location}
Existing skills: {existing_skills}

Skill gaps to address (sorted by priority):
{gaps_text}

Build a realistic week-by-week roadmap to close these gaps.
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

    data = json.loads(_raw)

    weeks = []
    for w in data.get("weekly_plan", []):
        resources = [Resource(**r) for r in w.get("resources", [])]
        weeks.append(WeekPlan(
            week=w["week"],
            focus=w["focus"],
            tasks=w.get("tasks", []),
            resources=resources,
            deliverable=w.get("deliverable", ""),
        ))

    return Roadmap(
        target_role=target_role,
        target_location=target_location,
        total_weeks=data.get("total_weeks", len(weeks)),
        weekly_plan=weeks,
        summary=data.get("summary", ""),
    )
