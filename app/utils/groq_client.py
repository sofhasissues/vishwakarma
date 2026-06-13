"""Shared Groq client and rate-limit helpers for the whole app."""
from groq import Groq
from app.config import settings
import threading

# All Groq calls share one client and one semaphore to cap concurrency.
# This prevents bursting through the per-minute token limit when multiple
# endpoints fire simultaneously (e.g. ATS + gaps analysis in parallel).
_groq_sem = threading.Semaphore(2)  # max 2 concurrent Groq requests
client = Groq(api_key=settings.groq_api_key)


def groq_chat(messages: list[dict], *, model: str = "llama-3.1-8b-instant",
              temperature: float = 0.1, max_tokens: int = 1024,
              json_mode: bool = False) -> str:
    """Throttled Groq chat call. Returns the message content string."""
    kwargs: dict = dict(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    with _groq_sem:
        response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content
