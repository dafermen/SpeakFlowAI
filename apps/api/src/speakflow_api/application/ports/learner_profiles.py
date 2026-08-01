"""Contrato de persistencia que la aplicación exige para perfiles."""

from __future__ import annotations

from typing import Protocol
from uuid import UUID

from speakflow_api.domain.learner import LearnerProfile


class LearnerProfileRepository(Protocol):
    """Puerto que desacopla los casos de uso del motor de base de datos."""

    def add(self, profile: LearnerProfile) -> None:
        """Programa un perfil nuevo para persistencia en la transacción actual."""

        ...

    def get(self, profile_id: UUID) -> LearnerProfile | None:
        """Obtiene un perfil por UUID o ``None`` cuando todavía no existe."""

        ...

    def save(self, profile: LearnerProfile) -> None:
        """Inserta o actualiza un perfil sin confirmar la transacción."""

        ...
