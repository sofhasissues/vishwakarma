import json
import uuid
from datetime import datetime, timezone
from app.utils.groq_client import groq_chat
from app.models.interview import InterviewMessage, InterviewFeedback

TECHNICAL_SYSTEM_PROMPT = """You are Arjun, a senior engineer at a top Indian tech company — sharp, warm, and genuinely curious. You've interviewed hundreds of candidates and you care about finding real talent, not just keyword matchers.

You're conducting a technical interview for a {role} position.
Candidate's skills: {skills}
Their skill gaps: {gaps}

Your personality:
- Smart and direct, but never cold
- Occasionally drop dry wit — "Interesting approach... bold choice" or "I like the confidence, let's see if the code agrees"
- Ask follow-ups that actually probe understanding, not just recitation
- If someone fumbles, give them a moment — "Take your time, think it through"
- You're genuinely impressed when someone surprises you

Rules:
- ONE question per turn. Always.
- Start warm: brief intro, then ease in with something approachable
- Progress: easy → medium → hard based on their answers
- Focus on skill gaps — that's where real signal is
- After 6-8 exchanges, wrap up professionally
- Never give away answers or hints
- Never say you're an AI"""

HR_SYSTEM_PROMPT = """You are Priya, an HR lead at a fast-growing Indian startup — empathetic, perceptive, and real. You've seen every type of candidate and you can spot authentic people from rehearsed ones.

You're conducting an HR interview for a {role} position.
Candidate background: {background}

Your personality:
- Warm and conversational, never corporate-speak
- Occasionally playful: "That's a very diplomatic answer — what do you actually think?"
- You dig for the real story behind polished answers
- You notice when someone's being genuine vs. performing
- You make people feel comfortable enough to be honest

Rules:
- ONE question per turn. Always.
- Start with a genuine warm welcome, then "Tell me about yourself"
- Cover: motivation, strengths/weaknesses, situational questions, culture fit
- Follow up based on what they actually say — don't just move to the next question
- After 6-8 exchanges, close warmly
- Never lead or hint at answers
- Never say you're an AI"""


def get_system_prompt(
    round_type: str,
    target_role: str,
    skills: list[str] = None,
    gaps: list[str] = None,
    background: str = None,
) -> str:
    if round_type == "technical":
        return TECHNICAL_SYSTEM_PROMPT.format(
            role=target_role,
            skills=", ".join(skills or []),
            gaps=", ".join(gaps or []),
        )
    else:
        return HR_SYSTEM_PROMPT.format(
            role=target_role,
            background=background or "Fresh graduate targeting their first role",
        )


def get_next_response(messages: list[InterviewMessage], system_prompt: str) -> str:
    groq_messages = [
        {
            "role": "user" if m.role == "candidate" else "assistant",
            "content": m.content
        }
        for m in messages
    ]

    if not groq_messages:
        groq_messages = [{"role": "user", "content": "Start the interview."}]

    return groq_chat(
        messages=[
            {"role": "system", "content": system_prompt},
            *groq_messages,
        ],
        temperature=0.8,
        max_tokens=512,
    )


def generate_feedback(
    messages: list[InterviewMessage],
    round_type: str,
    target_role: str,
) -> InterviewFeedback:
    transcript = "\n".join([f"{m.role.upper()}: {m.content}" for m in messages])

    prompt = f"""Analyze this {round_type} interview for a {target_role} position.

TRANSCRIPT:
{transcript}

Return ONLY valid JSON:
{{
  "overall_score": integer 1-10,
  "communication_score": integer 1-10,
  "technical_score": integer 1-10,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"],
  "recommendation": "strong yes|yes|maybe|no",
  "detailed_feedback": "3-4 sentence honest assessment, written like a real interviewer's notes — direct, specific, actionable"
}}"""

    raw = groq_chat(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1024,
        json_mode=True,
    )
    data = json.loads(raw)

    return InterviewFeedback(
        session_id=str(uuid.uuid4()),
        round_type=round_type,
        overall_score=data.get("overall_score", 5),
        communication_score=data.get("communication_score", 5),
        technical_score=data.get("technical_score", 0),
        strengths=data.get("strengths", []),
        improvements=data.get("improvements", []),
        recommendation=data.get("recommendation", "maybe"),
        detailed_feedback=data.get("detailed_feedback", ""),
    )
