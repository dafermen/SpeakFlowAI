"""Contrato de persistencia requerido por los casos de uso de práctica."""

from __future__ import annotations

from typing import Protocol
from uuid import UUID

from speakflow_api.domain.practice_session import PracticeSession


class PracticeSessionRepository(Protocol):
    """Puerto para guardar y consultar sesiones sin depender de SQLAlchemy."""

    def add(self, session: PracticeSession) -> None:
        """Programa una sesión terminada para persistencia."""

        ...

    def get(self, session_id: UUID) -> PracticeSession | None:
        """Devuelve una sesión por UUID o ``None`` si no existe."""

        ...

    def list_recent(self, learner_id: UUID, limit: int) -> tuple[PracticeSession, ...]:
        """Lista sesiones del alumno, de la más reciente a la más antigua."""

        ...
