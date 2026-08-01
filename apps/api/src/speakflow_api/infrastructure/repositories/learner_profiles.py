"""Implementación SQLAlchemy del puerto de perfiles de aprendizaje."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from speakflow_api.domain.learner import LearnerProfile
from speakflow_api.infrastructure.models import (
    LearnerGoalModel,
    LearnerProfileModel,
    LearnerTopicModel,
)


class SqlAlchemyLearnerProfileRepository:
    """Traduce entre ``LearnerProfile`` y las tablas normalizadas del perfil.

    El repositorio no confirma transacciones. Esa decisión pertenece a la unidad
    de trabajo que lo invoca mediante ``transactional_session``.
    """

    def __init__(self, session: Session) -> None:
        """Recibe la sesión activa donde se programarán lecturas y escrituras."""

        self._session = session

    def add(self, profile: LearnerProfile) -> None:
        """Convierte un perfil nuevo, sus metas y temas en modelos ORM."""

        self._session.add(
            LearnerProfileModel(
                id=str(profile.id),
                display_name=profile.display_name,
                native_language=profile.native_language,
                english_level=profile.english_level,
                preferred_feedback_style=profile.preferred_feedback_style,
                tutor_voice_id=profile.tutor_voice_id,
                speaking_speed=profile.speaking_speed,
                created_at_utc=profile.created_at_utc,
                updated_at_utc=profile.updated_at_utc,
                goals=[
                    LearnerGoalModel(value=value, ordinal=index)
                    for index, value in enumerate(profile.goals)
                ],
                topics=[
                    LearnerTopicModel(value=value, ordinal=index)
                    for index, value in enumerate(profile.topics)
                ],
            )
        )

    def get(self, profile_id: UUID) -> LearnerProfile | None:
        """Reconstruye el dominio por UUID o devuelve ``None`` si no existe."""

        record = self._session.get(LearnerProfileModel, str(profile_id))
        if record is None:
            return None
        return LearnerProfile(
            id=UUID(record.id),
            display_name=record.display_name,
            native_language=record.native_language,
            english_level=record.english_level,
            created_at_utc=record.created_at_utc,
            updated_at_utc=record.updated_at_utc,
            goals=tuple(item.value for item in record.goals),
            topics=tuple(item.value for item in record.topics),
            preferred_feedback_style=record.preferred_feedback_style,
            tutor_voice_id=record.tutor_voice_id,
            speaking_speed=record.speaking_speed,
        )

    def save(self, profile: LearnerProfile) -> None:
        """Inserta o actualiza el perfil y reemplaza sus colecciones ordenadas.

        ``flush`` materializa las eliminaciones antes de recrear metas y temas,
        evitando colisiones con sus restricciones de unicidad.
        """

        record = self._session.get(LearnerProfileModel, str(profile.id))
        if record is None:
            self.add(profile)
            return
        record.display_name = profile.display_name
        record.native_language = profile.native_language
        record.english_level = profile.english_level
        record.preferred_feedback_style = profile.preferred_feedback_style
        record.tutor_voice_id = profile.tutor_voice_id
        record.speaking_speed = profile.speaking_speed
        record.updated_at_utc = profile.updated_at_utc
        record.goals.clear()
        record.topics.clear()
        self._session.flush()
        record.goals = [
            LearnerGoalModel(value=value, ordinal=index)
            for index, value in enumerate(profile.goals)
        ]
        record.topics = [
            LearnerTopicModel(value=value, ordinal=index)
            for index, value in enumerate(profile.topics)
        ]
