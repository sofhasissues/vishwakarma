import httpx
import base64
import asyncio
from app.config import settings

def get_auth_header() -> str:
    encoded = base64.b64encode(f"{settings.did_api_key}:".encode()).decode()
    return f"Basic {encoded}"

PRESENTER_ID = "joan-eM9_4wA__d"  # Professional D-ID stock avatar (Joan)
DRIVER_ID = "Vcq0R4a8F0"          # natural driver

async def create_talk(text: str) -> str:
    """Send text to D-ID, get back video URL."""
    headers = {
        "Authorization": get_auth_header(),
        "Content-Type": "application/json",
    }
    payload = {
        "script": {
            "type": "text",
            "input": text,
            "provider": {
                "type": "microsoft",
                "voice_id": "en-IN-NeerjaNeural",
            }
        },
        "source_url": "https://i.imgur.gg/khh3os8-Screenshot_2026-03-19_124301.png",
        "config": {
            "fluent": True,
            "pad_audio": 0,
        }
    }

    async with httpx.AsyncClient(timeout=60) as client:
        # Create talk
        res = await client.post(
            "https://api.d-id.com/talks",
            json=payload,
            headers=headers,
        )
        res.raise_for_status()
        talk_id = res.json()["id"]

        # Poll until done
        for _ in range(30):
            await asyncio.sleep(2)
            status_res = await client.get(
                f"https://api.d-id.com/talks/{talk_id}",
                headers=headers,
            )
            data = status_res.json()
            if data.get("status") == "done":
                return data.get("result_url", "")
            if data.get("status") == "error":
                raise Exception(f"D-ID error: {data}")

    raise Exception("D-ID timed out")
