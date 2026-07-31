from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


@dataclass(frozen=True, slots=True)
class RealtimeCall:
    sdp_answer: str
    call_id: str | None


class RealtimeGatewayError(Exception):
    def __init__(self, category: str, status_code: int | None = None) -> None:
        super().__init__(category)
        self.category = category
        self.status_code = status_code


class RealtimeGateway(Protocol):
    async def create_call(
        self,
        sdp_offer: str,
        session_config: dict[str, Any],
    ) -> RealtimeCall: ...
