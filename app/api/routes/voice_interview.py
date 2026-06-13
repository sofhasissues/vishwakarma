from fastapi import APIRouter, HTTPException, UploadFile, File
import uuid
from datetime import datetime, timezone
from app.agents.mock_interview import get_system_prompt, get_next_response, generate_feedback
from app.models.interview import InterviewMessage
from app.services.did import create_talk
from app.config import settings
import httpx

router = APIRouter(prefix="/voice-interview", tags=["voice-interview"])
sessions: dict = {}


@router.post("/start")
async def start_voice_interview(
    round_type: str = "technical",
    target_role: str = "Data Analyst",
    skills: str = "",
    gaps: str = "",
    use_avatar: bool = True,
):
    session_id = str(uuid.uuid4())
    skills_list = [s.strip() for s in skills.split(",") if s.strip()]
    gaps_list = [g.strip() for g in gaps.split(",") if g.strip()]

    system_prompt = get_system_prompt(
        round_type=round_type,
        target_role=target_role,
        skills=skills_list,
        gaps=gaps_list,
    )
    opening = get_next_response([], system_prompt)

    video_url = None
    if use_avatar:
        try:
            video_url = await create_talk(opening)
        except Exception as e:
            print(f"D-ID failed: {e}")

    sessions[session_id] = {
        "session_id": session_id,
        "round_type": round_type,
        "target_role": target_role,
        "system_prompt": system_prompt,
        "messages": [{"role": "interviewer", "content": opening, "timestamp": datetime.now(timezone.utc).isoformat()}],
        "status": "active",
    }

    return {"session_id": session_id, "opening_message": opening, "video_url": video_url}


@router.post("/transcribe")
async def transcribe_audio(
    session_id: str,
    audio: UploadFile = File(...),
):
    """Transcribe uploaded audio file using Deepgram."""
    try:
        audio_bytes = await audio.read()
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                "https://api.deepgram.com/v1/listen?model=nova-2&language=en-IN&smart_format=true",
                headers={
                    "Authorization": f"Token {settings.deepgram_api_key}",
                    "Content-Type": "audio/webm",
                },
                content=audio_bytes,
            )
            data = res.json()
            transcript = data["results"]["channels"][0]["alternatives"][0]["transcript"]
            return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(500, f"Transcription failed: {str(e)}")


@router.post("/respond/{session_id}")
async def voice_respond(session_id: str, candidate_answer: str, use_avatar: bool = True):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")

    session = sessions[session_id]
    session["messages"].append({
        "role": "candidate", "content": candidate_answer,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    msg_objects = [InterviewMessage(**m) for m in session["messages"]]
    next_question = get_next_response(msg_objects, session["system_prompt"])

    session["messages"].append({
        "role": "interviewer", "content": next_question,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    video_url = None
    if use_avatar:
        try:
            video_url = await create_talk(next_question)
        except Exception as e:
            print(f"D-ID failed: {e}")

    return {
        "session_id": session_id,
        "interviewer_response": next_question,
        "video_url": video_url,
        "total_exchanges": len([m for m in session["messages"] if m["role"] == "candidate"]),
    }


@router.post("/end/{session_id}")
async def end_voice_interview(session_id: str):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")
    session = sessions[session_id]
    session["status"] = "completed"
    msg_objects = [InterviewMessage(**m) for m in session["messages"]]
    feedback = generate_feedback(
        messages=msg_objects,
        round_type=session["round_type"],
        target_role=session["target_role"],
    )
    return feedback
