"""Rutas HTTP para cerrar prácticas, consultar historial y calcular progreso."""

from __future__ import annotations

from collections import Counter
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, model_validator
from sqlalchemy.orm import Session, sessionmaker

from speakflow_api.api.learner_profile import LOCAL_LEARNER_ID
from speakflow_api.application.feedback import generate_feedback
from speakflow_api.domain.learner import LearnerProfile
from speakflow_api.domain.practice_session import PracticeSession, SessionFeedback, SessionTurn
from speakflow_api.infrastructure.database import transactional_session
from speakflow_api.infrastructure.repositories.learner_profiles import (
    SqlAlchemyLearnerProfileRepository,
)
from speakflow_api.infrastructure.repositories.practice_sessions import (
    SqlAlchemyPracticeSessionRepository,
)


class SessionTurnPayload(BaseModel):
    """Turno de conversación aceptado o devuelto por la API."""

    speaker: str = Field(pattern="^(learner|tutor)$")
    text: str = Field(min_length=1, max_length=2000)


class CompleteSessionPayload(BaseModel):
    """Entrada completa necesaria para finalizar y evaluar una práctica.

    Los límites protegen almacenamiento y coste. ``retain_transcript`` controla
    explícitamente si se permite persistir el texto de los turnos.
    """

    scenario_id: str = Field(min_length=1, max_length=120)
    mode_id: str = Field(min_length=1, max_length=120)
    provider: str = Field(pattern="^(deterministic|openai-realtime)$")
    difficulty: str = Field(pattern="^(a2|b1|b2|c1)$")
    duration_seconds: int = Field(ge=0, le=900)
    started_at_utc: datetime
    ended_at_utc: datetime
    retain_transcript: bool = False
    input_tokens: int = Field(default=0, ge=0, le=1_000_000)
    output_tokens: int = Field(default=0, ge=0, le=1_000_000)
    turns: list[SessionTurnPayload] = Field(default_factory=list, max_length=60)

    @model_validator(mode="after")
    def validate_timestamps(self) -> CompleteSessionPayload:
        """Rechaza intervalos negativos antes de ejecutar el caso de uso."""

        if self.ended_at_utc < self.started_at_utc:
            raise ValueError("ended_at_utc must not precede started_at_utc")
        return self


class FeedbackCorrectionResponse(BaseModel):
    """Corrección pedagógica serializable para el frontend."""

    original: str
    improved: str
    explanation: str


class VocabularyItemResponse(BaseModel):
    """Elemento de vocabulario contextual expuesto en la revisión."""

    term: str
    meaning_es: str
    example: str


class FeedbackObservationResponse(BaseModel):
    """Observación etiquetada que puede mostrarse o agregarse como métrica."""

    category: str
    note: str


class SessionFeedbackResponse(BaseModel):
    """Contrato HTTP de la revisión pedagógica completa."""

    summary: str
    strength: str
    focus_area: str
    corrections: list[FeedbackCorrectionResponse]
    vocabulary: list[VocabularyItemResponse]
    improved_phrases: list[str]
    observations: list[FeedbackObservationResponse]


class PracticeSessionResponse(BaseModel):
    """Detalle público de una sesión y su feedback asociado."""

    id: UUID
    scenario_id: str
    mode_id: str
    provider: str
    difficulty: str
    duration_seconds: int
    started_at_utc: datetime
    ended_at_utc: datetime
    retain_transcript: bool
    input_tokens: int
    output_tokens: int
    learner_turn_count: int
    tutor_turn_count: int
    turns: list[SessionTurnPayload]
    feedback: SessionFeedbackResponse


class SessionSummaryResponse(BaseModel):
    """Versión compacta para listas, sin cargar todas las relaciones."""

    id: UUID
    scenario_id: str
    mode_id: str
    provider: str
    difficulty: str
    duration_seconds: int
    ended_at_utc: datetime
    learner_turn_count: int
    summary: str
    focus_area: str
    correction_count: int
    vocabulary_count: int


class ProgressBreakdownResponse(BaseModel):
    """Par identificador/conteo usado por distribuciones del dashboard."""

    id: str
    count: int


class ProgressResponse(BaseModel):
    """Métricas agregadas y sesiones recientes del alumno local."""

    total_sessions: int
    total_minutes: int
    learner_turns: int
    current_streak_days: int
    sessions_by_mode: list[ProgressBreakdownResponse]
    focus_areas: list[ProgressBreakdownResponse]
    recent_sessions: list[SessionSummaryResponse]


def _feedback_response(feedback: SessionFeedback) -> SessionFeedbackResponse:
    """Traduce feedback del dominio a listas serializables por Pydantic."""

    return SessionFeedbackResponse(
        summary=feedback.summary,
        strength=feedback.strength,
        focus_area=feedback.focus_area,
        corrections=[
            FeedbackCorrectionResponse(
                original=item.original,
                improved=item.improved,
                explanation=item.explanation,
            )
            for item in feedback.corrections
        ],
        vocabulary=[
            VocabularyItemResponse(
                term=item.term,
                meaning_es=item.meaning_es,
                example=item.example,
            )
            for item in feedback.vocabulary
        ],
        improved_phrases=list(feedback.improved_phrases),
        observations=[
            FeedbackObservationResponse(category=item.category, note=item.note)
            for item in feedback.observations
        ],
    )


def _response(practice: PracticeSession) -> PracticeSessionResponse:
    """Traduce una sesión del dominio al contrato HTTP detallado."""

    return PracticeSessionResponse(
        id=practice.id,
        scenario_id=practice.scenario_id,
        mode_id=practice.mode_id,
        provider=practice.provider,
        difficulty=practice.difficulty,
        duration_seconds=practice.duration_seconds,
        started_at_utc=practice.started_at_utc,
        ended_at_utc=practice.ended_at_utc,
        retain_transcript=practice.retain_transcript,
        input_tokens=practice.input_tokens,
        output_tokens=practice.output_tokens,
        learner_turn_count=practice.learner_turn_count,
        tutor_turn_count=practice.tutor_turn_count,
        turns=[SessionTurnPayload(speaker=item.speaker, text=item.text) for item in practice.turns],
        feedback=_feedback_response(practice.feedback),
    )


def _ensure_local_learner(session: Session, difficulty: str) -> None:
    """Crea el alumno local mínimo si una sesión llega antes del onboarding.

    La inserción comparte la transacción de la práctica, de modo que ambas
    operaciones se confirman o revierten juntas.
    """

    repository = SqlAlchemyLearnerProfileRepository(session)
    if repository.get(LOCAL_LEARNER_ID) is not None:
        return
    now = datetime.now(UTC)
    repository.add(
        LearnerProfile(
            id=LOCAL_LEARNER_ID,
            display_name=None,
            native_language="es",
            english_level=difficulty,
            goals=(),
            topics=(),
            created_at_utc=now,
            updated_at_utc=now,
        )
    )


def _summary(practice: PracticeSession) -> SessionSummaryResponse:
    """Proyecta una sesión completa en el resumen usado por historial."""

    return SessionSummaryResponse(
        id=practice.id,
        scenario_id=practice.scenario_id,
        mode_id=practice.mode_id,
        provider=practice.provider,
        difficulty=practice.difficulty,
        duration_seconds=practice.duration_seconds,
        ended_at_utc=practice.ended_at_utc,
        learner_turn_count=practice.learner_turn_count,
        summary=practice.feedback.summary,
        focus_area=practice.feedback.focus_area,
        correction_count=len(practice.feedback.corrections),
        vocabulary_count=len(practice.feedback.vocabulary),
    )


def _current_streak(practices: tuple[PracticeSession, ...]) -> int:
    """Calcula días consecutivos de práctica hasta hoy o ayer.

    Varias sesiones del mismo día cuentan una sola vez. Una racha terminada
    antes de ayer devuelve cero porque ya no está vigente.
    """

    days = sorted({item.ended_at_utc.date() for item in practices}, reverse=True)
    if not days:
        return 0
    today = datetime.now(UTC).date()
    if days[0] not in {today, today - timedelta(days=1)}:
        return 0
    streak = 1
    for previous, current in zip(days, days[1:], strict=False):
        if previous - current != timedelta(days=1):
            break
        streak += 1
    return streak


def create_router(factory: sessionmaker[Session]) -> APIRouter:
    """Construye endpoints de sesiones enlazados a una fábrica inyectable."""

    router = APIRouter(prefix="/api/v1/sessions", tags=["practice-sessions"])

    @router.post("", response_model=PracticeSessionResponse, status_code=201)
    def complete_session(payload: CompleteSessionPayload) -> PracticeSessionResponse:
        """Finaliza, evalúa y persiste una práctica como una sola transacción."""

        turns = tuple(
            SessionTurn(item.speaker, item.text.strip(), index)
            for index, item in enumerate(payload.turns)
        )
        practice = PracticeSession(
            id=uuid4(),
            learner_id=LOCAL_LEARNER_ID,
            scenario_id=payload.scenario_id,
            mode_id=payload.mode_id,
            provider=payload.provider,
            difficulty=payload.difficulty,
            status="completed",
            duration_seconds=payload.duration_seconds,
            started_at_utc=payload.started_at_utc,
            ended_at_utc=payload.ended_at_utc,
            retain_transcript=payload.retain_transcript,
            input_tokens=payload.input_tokens,
            output_tokens=payload.output_tokens,
            learner_turn_count=sum(item.speaker == "learner" for item in turns),
            tutor_turn_count=sum(item.speaker == "tutor" for item in turns),
            turns=turns,
            feedback=generate_feedback(payload.scenario_id, turns),
        )
        with transactional_session(factory) as session:
            _ensure_local_learner(session, payload.difficulty)
            SqlAlchemyPracticeSessionRepository(session).add(practice)
        return _response(practice)

    @router.get("", response_model=list[SessionSummaryResponse])
    def list_sessions(
        limit: int = Query(default=20, ge=1, le=50),
    ) -> list[SessionSummaryResponse]:
        """Lista resúmenes recientes con un límite validado entre 1 y 50."""

        with transactional_session(factory) as session:
            practices = SqlAlchemyPracticeSessionRepository(session).list_recent(
                LOCAL_LEARNER_ID, limit
            )
            return [_summary(item) for item in practices]

    @router.get("/progress", response_model=ProgressResponse)
    def get_progress() -> ProgressResponse:
        """Agrega hasta 500 sesiones para construir el dashboard local."""

        with transactional_session(factory) as session:
            practices = SqlAlchemyPracticeSessionRepository(session).list_recent(
                LOCAL_LEARNER_ID, 500
            )
            modes = Counter(item.mode_id for item in practices)
            focus_areas = Counter(item.feedback.focus_area for item in practices)
            return ProgressResponse(
                total_sessions=len(practices),
                total_minutes=(sum(item.duration_seconds for item in practices) + 59) // 60,
                learner_turns=sum(item.learner_turn_count for item in practices),
                current_streak_days=_current_streak(practices),
                sessions_by_mode=[
                    ProgressBreakdownResponse(id=key, count=count)
                    for key, count in modes.most_common()
                ],
                focus_areas=[
                    ProgressBreakdownResponse(id=key, count=count)
                    for key, count in focus_areas.most_common(5)
                ],
                recent_sessions=[_summary(item) for item in practices[:5]],
            )

    @router.get("/{session_id}", response_model=PracticeSessionResponse)
    def get_session(session_id: UUID) -> PracticeSessionResponse:
        """Obtiene el detalle de una sesión o responde HTTP 404 si no existe."""

        with transactional_session(factory) as session:
            practice = SqlAlchemyPracticeSessionRepository(session).get(session_id)
            if practice is None:
                raise HTTPException(status_code=404, detail="Session not found")
            return _response(practice)

    return router
