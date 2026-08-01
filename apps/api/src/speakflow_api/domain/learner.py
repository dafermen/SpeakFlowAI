"""Entidades puras que representan a la persona que practica inglés."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True)
class LearnerProfile:
    """Perfil local independiente de HTTP, SQLAlchemy y LocalStorage.

    Las colecciones son tuplas para mantener el objeto inmutable. Las marcas de
    tiempo permiten distinguir creación y última actualización en persistencia.
    """

    id: UUID
    native_language: str
    english_level: str
    created_at_utc: datetime
    updated_at_utc: datetime
    display_name: str | None = None
    goals: tuple[str, ...] = ()
    topics: tuple[str, ...] = ()
    preferred_feedback_style: str = "balanced"
    tutor_voice_id: str = "voice-calm-1"
    speaking_speed: str = "normal"
