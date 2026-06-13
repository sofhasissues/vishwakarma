import asyncio
from app.config import settings
import httpx
import base64

def get_auth_header():
    encoded = base64.b64encode(f"{settings.did_api_key}:".encode()).decode()
    return f"Basic {encoded}"

async def run():
    async with httpx.AsyncClient() as client:
        r = await client.get("https://api.d-id.com/clips/presenters", headers={"Authorization": get_auth_header()})
        if r.status_code == 200:
            for p in r.json().get('presenters', []):
                if 'mia' in str(p).lower():
                    print("Found Mia (Clips):", p['id'], p.get('name', ''))
        
        r2 = await client.get("https://api.d-id.com/talks/presenters", headers={"Authorization": get_auth_header()})
        if r2.status_code == 200:
            for p in r2.json().get('presenters', []):
                if 'mia' in str(p).lower():
                    print("Found Mia (Talks):", p['id'], p.get('name', ''))

asyncio.run(run())
