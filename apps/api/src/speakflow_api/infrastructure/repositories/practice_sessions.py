"""Implementación SQLAlchemy del puerto de sesiones de práctica."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from speakflow_api.domain.practice_session import (
    FeedbackCorrection,
    FeedbackObservation,
    PracticeSession,
    SessionFeedback,
    SessionTurn,
    VocabularyItem,
)
from speakflow_api.infrastructure.models import (
    FeedbackCorrectionModel,
    FeedbackObservationModel,
    ImprovedPhraseModel,
    PracticeSessionModel,
    SessionFeedbackModel,
    SessionTurnModel,
    VocabularyItemModel,
)


class SqlAlchemyPracticeSessionRepository:
    """Mapea el agregado ``PracticeSession`` y todas sus relaciones.

    La sesión y el feedback siempre se guardan. El texto de los turnos solo se
    convierte a modelos ORM cuando existe consentimiento de retención.
    """

    def __init__(self, session: Session) -> None:
        """Conserva la sesión SQLAlchemy que controla la transacción."""

        self._session = session

    def add(self, practice: PracticeSession) -> None:
        """Programa el agregado completo para inserción respetando privacidad."""

        feedback = practice.feedback
        self._session.add(
            PracticeSessionModel(
                id=str(practice.id),
                learner_id=str(practice.learner_id),
                scenario_id=practice.scenario_id,
                mode_id=practice.mode_id,
                provider=practice.provider,
                difficulty=practice.difficulty,
                status=practice.status,
                duration_seconds=practice.duration_seconds,
                started_at_utc=practice.started_at_utc,
                ended_at_utc=practice.ended_at_utc,
                retain_transcript=practice.retain_transcript,
                input_tokens=practice.input_tokens,
                output_tokens=practice.output_tokens,
                learner_turn_count=practice.learner_turn_count,
                tutor_turn_count=practice.tutor_turn_count,
                turns=[
                    SessionTurnModel(
                        speaker=turn.speaker,
                        text=turn.text,
                        ordinal=turn.ordinal,
                    )
                    for turn in practice.turns
                    if practice.retain_transcript
                ],
                feedback=SessionFeedbackModel(
                    summary=feedback.summary,
                    strength=feedback.strength,
                    focus_area=feedback.focus_area,
                    corrections=[
                        FeedbackCorrectionModel(
                            original=item.original,
                            improved=item.improved,
                            explanation=item.explanation,
                        )
                        for item in feedback.corrections
                    ],
                    vocabulary=[
                        VocabularyItemModel(
                            term=item.term,
                            meaning_es=item.meaning_es,
                            example=item.example,
                        )
                        for item in feedback.vocabulary
                    ],
                    improved_phrases=[
                        ImprovedPhraseModel(text=text, ordinal=index)
                        for index, text in enumerate(feedback.improved_phrases)
                    ],
                    observations=[
                        FeedbackObservationModel(category=item.category, note=item.note)
                        for item in feedback.observations
                    ],
                ),
            )
        )

    def get(self, session_id: UUID) -> PracticeSession | None:
        """Busca una práctica por UUID y la traduce de ORM a dominio."""

        record = self._session.get(PracticeSessionModel, str(session_id))
        if record is None:
            return None
        return self._to_domain(record)

    def list_recent(self, learner_id: UUID, limit: int) -> tuple[PracticeSession, ...]:
        """Devuelve prácticas recientes de un alumno en orden descendente."""

        records = self._session.scalars(
            select(PracticeSessionModel)
            .where(PracticeSessionModel.learner_id == str(learner_id))
            .order_by(PracticeSessionModel.ended_at_utc.desc())
            .limit(limit)
        ).all()
        return tuple(self._to_domain(record) for record in records)

    def _to_domain(self, record: PracticeSessionModel) -> PracticeSession:
        """Reconstruye el agregado inmutable a partir del grafo ORM cargado."""

        feedback = record.feedback
        return PracticeSession(
            id=UUID(record.id),
            learner_id=UUID(record.learner_id),
            scenario_id=record.scenario_id,
            mode_id=record.mode_id,
            provider=record.provider,
            difficulty=record.difficulty,
            status=record.status,
            duration_seconds=record.duration_seconds,
            started_at_utc=record.started_at_utc,
            ended_at_utc=record.ended_at_utc,
            retain_transcript=record.retain_transcript,
            input_tokens=record.input_tokens,
            output_tokens=record.output_tokens,
            learner_turn_count=record.learner_turn_count,
            tutor_turn_count=record.tutor_turn_count,
            turns=tuple(
                SessionTurn(item.speaker, item.text, item.ordinal) for item in record.turns
            ),
            feedback=SessionFeedback(
                summary=feedback.summary,
                strength=feedback.strength,
                focus_area=feedback.focus_area,
                corrections=tuple(
                    FeedbackCorrection(item.original, item.improved, item.explanation)
                    for item in feedback.corrections
                ),
                vocabulary=tuple(
                    VocabularyItem(item.term, item.meaning_es, item.example)
                    for item in feedback.vocabulary
                ),
                improved_phrases=tuple(item.text for item in feedback.improved_phrases),
                observations=tuple(
                    FeedbackObservation(item.category, item.note) for item in feedback.observations
                ),
            ),
        )
