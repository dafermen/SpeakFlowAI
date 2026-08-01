"""Adaptador HTTP que implementa el puerto Realtime contra OpenAI."""

from __future__ import annotations

import json
from typing import Any

import httpx

from speakflow_api.application.ports.realtime import (
    RealtimeCall,
    RealtimeGatewayError,
)


class OpenAIRealtimeGateway:
    """Intercambia SDP con OpenAI sin exponer credenciales a la capa web."""

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = "https://api.openai.com",
        safety_identifier: str = "speakflow-local-single-learner",
        timeout_seconds: float = 20.0,
    ) -> None:
        """Configura credencial, endpoint, identificador de seguridad y timeout.

        ``base_url`` es inyectable para pruebas. La clave queda en un atributo
        privado y nunca se incorpora a las excepciones públicas.
        """

        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._safety_identifier = safety_identifier
        self._timeout_seconds = timeout_seconds

    async def create_call(
        self,
        sdp_offer: str,
        session_config: dict[str, Any],
    ) -> RealtimeCall:
        """Envía oferta SDP y configuración como formulario multipart.

        Args:
            sdp_offer: Descripción WebRTC creada por el navegador.
            session_config: Configuración validada y construida por la API.

        Returns:
            Respuesta SDP y, si el proveedor lo informa, identificador de llamada.

        Raises:
            RealtimeGatewayError: Categoriza timeout, red, límite o rechazo remoto.
        """

        try:
            async with httpx.AsyncClient(timeout=self._timeout_seconds) as client:
                response = await client.post(
                    f"{self._base_url}/v1/realtime/calls",
                    headers={
                        "Authorization": f"Bearer {self._api_key}",
                        "OpenAI-Safety-Identifier": self._safety_identifier,
                    },
                    files={
                        "sdp": (None, sdp_offer, "application/sdp"),
                        "session": (
                            None,
                            json.dumps(session_config),
                            "application/json",
                        ),
                    },
                )
        except httpx.TimeoutException as error:
            raise RealtimeGatewayError("timeout") from error
        except httpx.HTTPError as error:
            raise RealtimeGatewayError("network") from error

        if response.status_code >= 400:
            category = "rate-limited" if response.status_code == 429 else "upstream"
            raise RealtimeGatewayError(category, response.status_code)

        location = response.headers.get("Location")
        call_id = location.rstrip("/").rsplit("/", 1)[-1] if location else None
        return RealtimeCall(sdp_answer=response.text, call_id=call_id)
