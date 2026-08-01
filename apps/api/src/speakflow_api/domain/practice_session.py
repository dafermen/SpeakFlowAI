"""Entidades de dominio para una práctica completada y su retroalimentación."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True)
class SessionTurn:
    """Intervención ordenada del alumno o del tutor dentro de una sesión."""

    speaker: str
    text: str
    ordinal: int


@dataclass(frozen=True, slots=True)
class FeedbackCorrection:
    """Corrección que conserva el texto detectado y propone una versión mejor."""

    original: str
    improved: str
    explanation: str


@dataclass(frozen=True, slots=True)
class VocabularyItem:
    """Palabra contextual con traducción al español y ejemplo reutilizable."""

    term: str
    meaning_es: str
    example: str


@dataclass(frozen=True, slots=True)
class FeedbackObservation:
    """Observación categorizada para métricas o próximos pasos."""

    category: str
    note: str


@dataclass(frozen=True, slots=True)
class SessionFeedback:
    """Resultado pedagógico agregado que se presenta en la revisión final."""

    summary: str
    strength: str
    focus_area: str
    corrections: tuple[FeedbackCorrection, ...] = ()
    vocabulary: tuple[VocabularyItem, ...] = ()
    improved_phrases: tuple[str, ...] = ()
    observations: tuple[FeedbackObservation, ...] = ()


@dataclass(frozen=True, slots=True)
class PracticeSession:
    """Registro completo e inmutable de una práctica terminada.

    Puede contener turnos en memoria, pero el repositorio solo guarda su texto
    cuando ``retain_transcript`` expresa el consentimiento del alumno.
    """

    id: UUID
    learner_id: UUID
    scenario_id: str
    mode_id: str
    provider: str
    difficulty: str
    status: str
    duration_seconds: int
    started_at_utc: datetime
    ended_at_utc: datetime
    retain_transcript: bool
    input_tokens: int
    output_tokens: int
    learner_turn_count: int
    tutor_turn_count: int
    turns: tuple[SessionTurn, ...]
    feedback: SessionFeedback
