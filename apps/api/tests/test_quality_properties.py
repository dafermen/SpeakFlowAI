from __future__ import annotations

import random
import string
from pathlib import Path

import pytest

from speakflow_api.application.feedback import generate_feedback
from speakflow_api.core.config import load_settings
from speakflow_api.domain.practice_session import SessionTurn


def test_relative_storage_paths_resolve_from_repository(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SPEAKFLOW_DATA_DIR", "./data")
    monkeypatch.setenv(
        "SPEAKFLOW_DATABASE_URL",
        "sqlite:///./data/speakflowai-dev.db",
    )

    settings = load_settings()
    repository_root = next(
        parent
        for parent in Path(__file__).resolve().parents
        if (parent / "pnpm-workspace.yaml").exists()
    )
    expected_database = (repository_root / "data" / "speakflowai-dev.db").resolve()

    assert settings.data_dir == (repository_root / "data").resolve()
    assert settings.database_url == f"sqlite:///{expected_database.as_posix()}"


def test_feedback_is_bounded_for_generated_unicode_inputs() -> None:
    randomizer = random.Random(20260731)
    alphabet = string.ascii_letters + string.digits + " .,!?áéíóú🙂\n"

    for index in range(200):
        text = "".join(randomizer.choice(alphabet) for _ in range(index % 160)).strip()
        turns = () if not text else (SessionTurn("learner", text, 0),)
        feedback = generate_feedback("scenario.daily.coffee-shop", turns)

        assert feedback.summary
        assert feedback.strength
        assert feedback.focus_area
        assert len(feedback.corrections) <= 3
        assert len(feedback.improved_phrases) <= 3
        assert len(feedback.vocabulary) <= 3


@pytest.mark.parametrize(
    ("variable", "raw", "expected"),
    [
        ("SPEAKFLOW_REALTIME_MAX_OUTPUT_TOKENS", "invalid", 350),
        ("SPEAKFLOW_REALTIME_MAX_OUTPUT_TOKENS", "999999", 2_000),
        ("SPEAKFLOW_REALTIME_MAX_OUTPUT_TOKENS", "1", 50),
        ("SPEAKFLOW_REALTIME_SESSION_LIMIT_MINUTES", "90", 15),
        ("SPEAKFLOW_REALTIME_SESSION_LIMIT_MINUTES", "0", 1),
    ],
)
def test_cost_configuration_falls_back_or_stays_bounded(
    monkeypatch: pytest.MonkeyPatch,
    variable: str,
    raw: str,
    expected: int,
) -> None:
    monkeypatch.setenv(variable, raw)

    settings = load_settings()

    value = (
        settings.realtime_max_output_tokens
        if variable.endswith("OUTPUT_TOKENS")
        else settings.realtime_session_limit_minutes
    )
    assert value == expected
