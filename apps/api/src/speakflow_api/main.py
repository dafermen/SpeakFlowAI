from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from speakflow_api.api.learner_profile import create_router
from speakflow_api.api.practice_sessions import create_router as create_sessions_router
from speakflow_api.api.realtime import create_router as create_realtime_router
from speakflow_api.core.config import load_settings
from speakflow_api.core.http import HttpHardeningMiddleware
from speakflow_api.infrastructure.database import create_database_engine, create_session_factory
from speakflow_api.infrastructure.openai_realtime import OpenAIRealtimeGateway


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


app = FastAPI(
    title="SpeakFlowAI API",
    summary="Backend boundary for the SpeakFlowAI learning companion.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:4173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://localhost:5173",
        "https://localhost",
        "capacitor://localhost",
    ],
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)
app.add_middleware(HttpHardeningMiddleware)

_settings = load_settings()
_settings.data_dir.mkdir(parents=True, exist_ok=True)
_engine = create_database_engine(_settings.database_url)
_session_factory = create_session_factory(_engine)
app.include_router(create_router(_session_factory))
app.include_router(create_sessions_router(_session_factory))
_realtime_gateway = (
    OpenAIRealtimeGateway(_settings.openai_api_key) if _settings.openai_api_key else None
)
app.include_router(create_realtime_router(_settings, _realtime_gateway))


@app.get("/api/v1/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="speakflow-api", version="1.0.0")
