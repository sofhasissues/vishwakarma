import json
from app.utils.groq_client import groq_chat


SYSTEM_PROMPT = """You are a technical quiz generator.
Generate a 5-question multiple choice quiz to verify skill knowledge.

Return ONLY valid JSON:
{
  "skill": "string",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
      "correct": "A",
      "explanation": "why this is correct"
    }
  ]
}

Make questions practical and role-specific. Mix easy (2), medium (2), hard (1)."""


def generate_quiz(skill: str, target_role: str) -> dict:
    _raw = groq_chat(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Skill: {skill}\nRole: {target_role}"}
        ],
        temperature=0.3,
        max_tokens=2048,
        json_mode=True,
    )
    return json.loads(_raw)


def score_quiz(questions: list, answers: dict) -> dict:
    correct = 0
    results = []
    for q in questions:
        user_ans = answers.get(str(q["id"]), "")
        is_correct = user_ans.startswith(q["correct"])
        if is_correct:
            correct += 1
        results.append({
            "id": q["id"],
            "question": q["question"],
            "user_answer": user_ans,
            "correct_answer": q["correct"],
            "is_correct": is_correct,
            "explanation": q["explanation"],
        })
    score = (correct / len(questions)) * 100
    return {
        "score": round(score),
        "correct": correct,
        "total": len(questions),
        "passed": score >= 80,
        "results": results,
    }
