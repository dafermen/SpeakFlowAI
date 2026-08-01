"""Tipos y puerto que aíslan la API del proveedor de voz Realtime."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


@dataclass(frozen=True, slots=True)
class RealtimeCall:
    """Respuesta de negociación que el backend puede devolver al navegador."""

    sdp_answer: str
    call_id: str | None


class RealtimeGatewayError(Exception):
    """Error estable del adaptador, sin detalles sensibles del proveedor."""

    def __init__(self, category: str, status_code: int | None = None) -> None:
        """Conserva una categoría pública y, opcionalmente, el estado remoto."""

        super().__init__(category)
        self.category = category
        self.status_code = status_code


class RealtimeGateway(Protocol):
    """Operación mínima que cualquier proveedor Realtime debe implementar."""

    async def create_call(
        self,
        sdp_offer: str,
        session_config: dict[str, Any],
    ) -> RealtimeCall:
        """Intercambia una oferta SDP y configuración por una respuesta SDP.

        Raises:
            RealtimeGatewayError: Si hay timeout, red, límite o rechazo remoto.
        """

        ...
