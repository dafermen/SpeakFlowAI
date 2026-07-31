from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, sessionmaker

from speakflow_api.domain.learner import LearnerProfile
from speakflow_api.infrastructure.database import transactional_session
from speakflow_api.infrastructure.repositories.learner_profiles import (
    SqlAlchemyLearnerProfileRepository,
)

LOCAL_LEARNER_ID = UUID("00000000-0000-4000-8000-000000000001")


class LearnerProfilePayload(BaseModel):
    display_name: str | None = Field(default=None, max_length=80)
    native_language: str = Field(default="es", min_length=2, max_length=10)
    english_level: str = Field(pattern="^(a2|b1|b2|c1|unsure)$")
    goals: list[str] = Field(default_factory=list, max_length=6)
    topics: list[str] = Field(default_factory=list, max_length=8)
    preferred_feedback_style: str = Field(default="balanced", max_length=20)
    tutor_voice_id: str = Field(default="voice-calm-1", min_length=1, max_length=80)
    speaking_speed: str = Field(default="normal", pattern="^(slow|normal|fast)$")


class LearnerProfileResponse(LearnerProfilePayload):
    id: UUID
    updated_at_utc: datetime


def create_router(factory: sessionmaker[Session]) -> APIRouter:
    router = APIRouter(prefix="/api/v1/learner-profile", tags=["learner-profile"])

    def get_session() -> Iterator[Session]:
        session = factory()
        try:
            yield session
        finally:
            session.close()

    @router.get("", response_model=LearnerProfileResponse | None)
    def get_profile(
        session: Session = Depends(get_session),  # noqa: B008
    ) -> LearnerProfileResponse | None:
        profile = SqlAlchemyLearnerProfileRepository(session).get(LOCAL_LEARNER_ID)
        if profile is None:
            return None
        return LearnerProfileResponse(
            id=profile.id,
            display_name=profile.display_name,
            native_language=profile.native_language,
            english_level=profile.english_level,
            goals=list(profile.goals),
            topics=list(profile.topics),
            preferred_feedback_style=profile.preferred_feedback_style,
            tutor_voice_id=profile.tutor_voice_id,
            speaking_speed=profile.speaking_speed,
            updated_at_utc=profile.updated_at_utc,
        )

    @router.put("", response_model=LearnerProfileResponse)
    def save_profile(payload: LearnerProfilePayload) -> LearnerProfileResponse:
        now = datetime.now(UTC)
        profile = LearnerProfile(
            id=LOCAL_LEARNER_ID,
            display_name=payload.display_name,
            native_language=payload.native_language,
            english_level=payload.english_level,
            goals=tuple(payload.goals),
            topics=tuple(payload.topics),
            preferred_feedback_style=payload.preferred_feedback_style,
            tutor_voice_id=payload.tutor_voice_id,
            speaking_speed=payload.speaking_speed,
            created_at_utc=now,
            updated_at_utc=now,
        )
        with transactional_session(factory) as session:
            SqlAlchemyLearnerProfileRepository(session).save(profile)
        return LearnerProfileResponse(
            id=profile.id,
            display_name=profile.display_name,
            native_language=profile.native_language,
            english_level=profile.english_level,
            goals=list(profile.goals),
            topics=list(profile.topics),
            preferred_feedback_style=profile.preferred_feedback_style,
            tutor_voice_id=profile.tutor_voice_id,
            speaking_speed=profile.speaking_speed,
            updated_at_utc=profile.updated_at_utc,
        )

    return router
