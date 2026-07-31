from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True)
class SessionTurn:
    speaker: str
    text: str
    ordinal: int


@dataclass(frozen=True, slots=True)
class FeedbackCorrection:
    original: str
    improved: str
    explanation: str


@dataclass(frozen=True, slots=True)
class VocabularyItem:
    term: str
    meaning_es: str
    example: str


@dataclass(frozen=True, slots=True)
class FeedbackObservation:
    category: str
    note: str


@dataclass(frozen=True, slots=True)
class SessionFeedback:
    summary: str
    strength: str
    focus_area: str
    corrections: tuple[FeedbackCorrection, ...] = ()
    vocabulary: tuple[VocabularyItem, ...] = ()
    improved_phrases: tuple[str, ...] = ()
    observations: tuple[FeedbackObservation, ...] = ()


@dataclass(frozen=True, slots=True)
class PracticeSession:
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
