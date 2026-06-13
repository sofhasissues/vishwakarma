from app.utils.groq_client import groq_chat
from app.config import settings
import json
import logging

logger = logging.getLogger(__name__)


def gemini_json(prompt: str) -> dict:
    """Call Groq (llama-3.1-8b-instant) and return parsed JSON.

    Name kept as 'gemini_json' to avoid changing all call-sites.
    """
    text = groq_chat(
        messages=[{"role": "user", "content": f"{prompt}\n\nReturn ONLY valid JSON, no markdown, no explanation."}],
        json_mode=True,
    )
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
