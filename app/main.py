from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.utils.logger import setup_logging
from app.api.routes import (
    resume, analysis, roadmap, tracker, interview,
    auth, intelligence, voice_interview, history, quiz,
    notifications
)

try:
    from app.api.routes import resume_builder
    HAS_RESUME_BUILDER = True
except:
    HAS_RESUME_BUILDER = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    yield


app = FastAPI(title="Vishwakarma API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(analysis.router)
app.include_router(roadmap.router)
app.include_router(tracker.router)
app.include_router(interview.router)
app.include_router(intelligence.router)
app.include_router(voice_interview.router)
app.include_router(history.router)
app.include_router(quiz.router)
app.include_router(notifications.router)
if HAS_RESUME_BUILDER:
    app.include_router(resume_builder.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
