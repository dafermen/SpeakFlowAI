from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.testclient import TestClient

from speakflow_api.api.learner_profile import create_router
from speakflow_api.infrastructure.database import (
    create_database_engine,
    create_session_factory,
)


def _migration_config(database_url: str) -> Config:
    api_root = Path(__file__).resolve().parents[1]
    config = Config(str(api_root / "alembic.ini"))
    config.set_main_option("script_location", str(api_root / "migrations"))
    config.set_main_option("sqlalchemy.url", database_url)
    return config


def test_profile_can_be_created_updated_and_read(tmp_path: Path) -> None:
    database_url = f"sqlite:///{(tmp_path / 'profile-api.db').as_posix()}"
    command.upgrade(_migration_config(database_url), "head")
    engine = create_database_engine(database_url)
    app = FastAPI()
    app.include_router(create_router(create_session_factory(engine)))

    with TestClient(app) as client:
        empty_response = client.get("/api/v1/learner-profile")
        assert empty_response.status_code == 200
        assert empty_response.json() is None

        payload = {
            "display_name": "Daf",
            "native_language": "es",
            "english_level": "b1",
            "goals": ["Speak with confidence"],
            "topics": ["Technology", "Travel"],
            "preferred_feedback_style": "balanced",
            "tutor_voice_id": "voice-calm-1",
            "speaking_speed": "normal",
        }
        save_response = client.put("/api/v1/learner-profile", json=payload)
        assert save_response.status_code == 200
        assert save_response.json()["goals"] == ["Speak with confidence"]

        payload["speaking_speed"] = "slow"
        update_response = client.put("/api/v1/learner-profile", json=payload)
        assert update_response.status_code == 200

        read_response = client.get("/api/v1/learner-profile")
        assert read_response.status_code == 200
        assert read_response.json()["speaking_speed"] == "slow"
        assert read_response.json()["topics"] == ["Technology", "Travel"]

    engine.dispose()
