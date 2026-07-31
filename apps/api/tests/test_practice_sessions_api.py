from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import text

from speakflow_api.api.practice_sessions import create_router
from speakflow_api.infrastructure.database import create_database_engine, create_session_factory


def _migration_config(database_url: str) -> Config:
    api_root = Path(__file__).resolve().parents[1]
    config = Config(str(api_root / "alembic.ini"))
    config.set_main_option("script_location", str(api_root / "migrations"))
    config.set_main_option("sqlalchemy.url", database_url)
    return config


def _payload(retain_transcript: bool) -> dict[str, object]:
    return {
        "scenario_id": "scenario.daily.coffee-shop",
        "mode_id": "mode.daily-conversation",
        "provider": "deterministic",
        "difficulty": "b1",
        "duration_seconds": 42,
        "started_at_utc": "2026-07-31T01:00:00Z",
        "ended_at_utc": "2026-07-31T01:00:42Z",
        "retain_transcript": retain_transcript,
        "input_tokens": 10,
        "output_tokens": 20,
        "turns": [
            {"speaker": "tutor", "text": "What would you like?"},
            {"speaker": "learner", "text": "I want a coffee, please."},
        ],
    }


def test_session_feedback_is_persisted_without_raw_transcript_by_default(
    tmp_path: Path,
) -> None:
    database_url = f"sqlite:///{(tmp_path / 'sessions-api.db').as_posix()}"
    command.upgrade(_migration_config(database_url), "head")
    engine = create_database_engine(database_url)
    app = FastAPI()
    app.include_router(create_router(create_session_factory(engine)))

    with TestClient(app) as client:
        response = client.post("/api/v1/sessions", json=_payload(False))
        assert response.status_code == 201
        review = response.json()
        assert review["feedback"]["corrections"][0]["improved"] == "I'd like"
        assert review["turns"] == _payload(False)["turns"]

        read_response = client.get(f"/api/v1/sessions/{review['id']}")
        assert read_response.status_code == 200
        assert read_response.json()["turns"] == []

        history_response = client.get("/api/v1/sessions")
        assert history_response.status_code == 200
        assert history_response.json()[0]["learner_turn_count"] == 1

        progress_response = client.get("/api/v1/sessions/progress")
        assert progress_response.status_code == 200
        assert progress_response.json()["total_sessions"] == 1
        assert progress_response.json()["total_minutes"] == 1
        assert progress_response.json()["learner_turns"] == 1

    with engine.connect() as connection:
        assert connection.execute(text("SELECT COUNT(*) FROM session_turns")).scalar_one() == 0
        assert connection.execute(text("SELECT COUNT(*) FROM session_feedback")).scalar_one() == 1
    engine.dispose()


def test_session_transcript_is_retained_only_with_consent(tmp_path: Path) -> None:
    database_url = f"sqlite:///{(tmp_path / 'retained-session.db').as_posix()}"
    command.upgrade(_migration_config(database_url), "head")
    engine = create_database_engine(database_url)
    app = FastAPI()
    app.include_router(create_router(create_session_factory(engine)))

    with TestClient(app) as client:
        response = client.post("/api/v1/sessions", json=_payload(True))
        assert response.status_code == 201
        session_id = response.json()["id"]
        assert len(client.get(f"/api/v1/sessions/{session_id}").json()["turns"]) == 2

    engine.dispose()
