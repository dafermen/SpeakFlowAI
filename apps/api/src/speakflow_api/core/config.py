from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


def _repository_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "pnpm-workspace.yaml").exists():
            return parent
    return Path.cwd()


def _bounded_int(name: str, default: int, minimum: int, maximum: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        value = int(raw)
    except ValueError:
        return default
    return min(maximum, max(minimum, value))


def _resolve_from_repository(path: Path, repository_root: Path) -> Path:
    return (path if path.is_absolute() else repository_root / path).resolve()


def _resolve_database_url(raw: str | None, data_dir: Path, repository_root: Path) -> str:
    if raw is None:
        return f"sqlite:///{(data_dir / 'speakflowai-dev.db').as_posix()}"
    prefix = "sqlite:///"
    if not raw.startswith(prefix):
        return raw
    sqlite_path = raw.removeprefix(prefix)
    if sqlite_path == ":memory:":
        return raw
    resolved_path = _resolve_from_repository(Path(sqlite_path), repository_root)
    return f"{prefix}{resolved_path.as_posix()}"


@dataclass(frozen=True, slots=True)
class Settings:
    environment: str
    data_dir: Path
    database_url: str
    openai_api_key: str | None = field(default=None, repr=False)
    realtime_model: str = "gpt-realtime-2.1-mini"
    realtime_transcription_model: str = "gpt-4o-transcribe"
    realtime_max_output_tokens: int = 350
    realtime_session_limit_minutes: int = 15


def load_settings() -> Settings:
    repository_root = _repository_root()
    data_dir = _resolve_from_repository(
        Path(os.getenv("SPEAKFLOW_DATA_DIR", "data")),
        repository_root,
    )
    database_url = _resolve_database_url(
        os.getenv("SPEAKFLOW_DATABASE_URL"),
        data_dir,
        repository_root,
    )
    return Settings(
        environment=os.getenv("SPEAKFLOW_ENV", "development"),
        data_dir=data_dir,
        database_url=database_url,
        openai_api_key=os.getenv("OPENAI_API_KEY") or None,
        realtime_model=os.getenv(
            "SPEAKFLOW_REALTIME_MODEL",
            "gpt-realtime-2.1-mini",
        ),
        realtime_transcription_model=os.getenv(
            "SPEAKFLOW_TRANSCRIPTION_MODEL",
            "gpt-4o-transcribe",
        ),
        realtime_max_output_tokens=_bounded_int(
            "SPEAKFLOW_REALTIME_MAX_OUTPUT_TOKENS", 350, 50, 2_000
        ),
        realtime_session_limit_minutes=_bounded_int(
            "SPEAKFLOW_REALTIME_SESSION_LIMIT_MINUTES", 15, 1, 15
        ),
    )
