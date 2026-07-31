from __future__ import annotations

from typing import Protocol
from uuid import UUID

from speakflow_api.domain.learner import LearnerProfile


class LearnerProfileRepository(Protocol):
    def add(self, profile: LearnerProfile) -> None: ...

    def get(self, profile_id: UUID) -> LearnerProfile | None: ...

    def save(self, profile: LearnerProfile) -> None: ...
