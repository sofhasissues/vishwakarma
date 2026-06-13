from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import Response
import uuid
import json
from datetime import datetime, timezone
from app.agents.mock_interview import (
    get_system_prompt,
    get_next_response,
    generate_feedback,
)
from app.models.interview import InterviewMessage, InterviewSession
from app.services.tts import text_to_speech

router = APIRouter(prefix="/interview", tags=["interview"])

# In-memory session store for now (will move to Redis later)
sessions: dict = {}


@router.post("/start")
async def start_interview(
    round_type: str = "technical",
    target_role: str = "Data Analyst",
    skills: str = "",
    gaps: str = "",
):
    """Start a new interview session. Returns session_id and opening question."""
    if round_type not in ["technical", "hr"]:
        raise HTTPException(400, "round_type must be 'technical' or 'hr'")

    session_id = str(uuid.uuid4())
    skills_list = [s.strip() for s in skills.split(",") if s.strip()]
    gaps_list = [g.strip() for g in gaps.split(",") if g.strip()]

    system_prompt = get_system_prompt(
        round_type=round_type,
        target_role=target_role,
        skills=skills_list,
        gaps=gaps_list,
    )

    # Get opening message from interviewer
    opening = get_next_response([], system_prompt)

    session = {
        "session_id": session_id,
        "round_type": round_type,
        "target_role": target_role,
        "system_prompt": system_prompt,
        "messages": [
            {
                "role": "interviewer",
                "content": opening,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        ],
        "status": "active",
    }
    sessions[session_id] = session

    return {
        "session_id": session_id,
        "round_type": round_type,
        "opening_message": opening,
    }


@router.post("/respond/{session_id}")
async def respond_to_interview(session_id: str, candidate_answer: str):
    """Send candidate's answer, get next interviewer question."""
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")

    session = sessions[session_id]
    if session["status"] != "active":
        raise HTTPException(400, "Session is not active")

    # Add candidate message
    session["messages"].append({
        "role": "candidate",
        "content": candidate_answer,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # Convert to InterviewMessage objects
    msg_objects = [InterviewMessage(**m) for m in session["messages"]]

    # Get next interviewer response
    next_question = get_next_response(msg_objects, session["system_prompt"])

    session["messages"].append({
        "role": "interviewer",
        "content": next_question,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "session_id": session_id,
        "interviewer_response": next_question,
        "total_exchanges": len([m for m in session["messages"] if m["role"] == "candidate"]),
    }


@router.get("/audio/{session_id}")
async def get_last_response_audio(session_id: str):
    """Get the last interviewer response as audio (MP3)."""
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")

    session = sessions[session_id]
    interviewer_messages = [
        m for m in session["messages"] if m["role"] == "interviewer"
    ]

    if not interviewer_messages:
        raise HTTPException(404, "No interviewer messages found")

    last_message = interviewer_messages[-1]["content"]
    audio_bytes = text_to_speech(last_message)

    return Response(content=audio_bytes, media_type="audio/mpeg")


@router.post("/end/{session_id}")
async def end_interview(session_id: str):
    """End session and generate feedback report."""
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


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get full session transcript."""
    if session_id not in sessions:
        raise HTTPException(404, "Session not found")
    return sessions[session_id]
