from __future__ import annotations

from typing import Protocol
from uuid import UUID

from speakflow_api.domain.practice_session import PracticeSession


class PracticeSessionRepository(Protocol):
    def add(self, session: PracticeSession) -> None: ...

    def get(self, session_id: UUID) -> PracticeSession | None: ...

    def list_recent(self, learner_id: UUID, limit: int) -> tuple[PracticeSession, ...]: ...
