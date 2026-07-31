from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text

from speakflow_api.domain.learner import LearnerProfile
from speakflow_api.infrastructure.database import (
    create_database_engine,
    create_session_factory,
    transactional_session,
)
from speakflow_api.infrastructure.repositories.learner_profiles import (
    SqlAlchemyLearnerProfileRepository,
)


def _migration_config(database_url: str) -> Config:
    api_root = Path(__file__).resolve().parents[1]
    config = Config(str(api_root / "alembic.ini"))
    config.set_main_option("script_location", str(api_root / "migrations"))
    config.set_main_option("sqlalchemy.url", database_url)
    return config


def test_migration_is_reversible_and_foreign_keys_are_enabled(tmp_path: Path) -> None:
    database_url = f"sqlite:///{(tmp_path / 'migration.db').as_posix()}"
    config = _migration_config(database_url)

    command.upgrade(config, "head")
    engine = create_database_engine(database_url)

    assert set(inspect(engine).get_table_names()) >= {
        "learner_profiles",
        "learner_goals",
        "learner_topics",
        "practice_sessions",
        "session_turns",
        "session_feedback",
        "feedback_corrections",
        "vocabulary_items",
        "improved_phrases",
        "feedback_observations",
    }
    with engine.connect() as connection:
        assert connection.execute(text("PRAGMA foreign_keys")).scalar_one() == 1

    engine.dispose()
    command.downgrade(config, "base")
    engine = create_database_engine(database_url)
    assert "learner_profiles" not in inspect(engine).get_table_names()
    engine.dispose()


def test_repository_round_trip_uses_domain_entity(tmp_path: Path) -> None:
    database_url = f"sqlite:///{(tmp_path / 'repository.db').as_posix()}"
    command.upgrade(_migration_config(database_url), "head")
    engine = create_database_engine(database_url)
    factory = create_session_factory(engine)
    now = datetime.now(UTC)
    expected = LearnerProfile(
        id=uuid4(),
        display_name="Alex",
        native_language="es",
        english_level="b1",
        goals=("Improve confidence",),
        topics=("Technology",),
        tutor_voice_id="voice-warm-1",
        created_at_utc=now,
        updated_at_utc=now,
    )

    with transactional_session(factory) as session:
        SqlAlchemyLearnerProfileRepository(session).add(expected)

    with transactional_session(factory) as session:
        actual = SqlAlchemyLearnerProfileRepository(session).get(expected.id)

    assert actual is not None
    assert actual.id == expected.id
    assert actual.english_level == "b1"
    assert actual.goals == ("Improve confidence",)
    assert actual.topics == ("Technology",)
    assert actual.tutor_voice_id == "voice-warm-1"
    engine.dispose()
