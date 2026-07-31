from __future__ import annotations

import logging
import re
from time import perf_counter
from uuid import uuid4

from starlette.datastructures import Headers, MutableHeaders
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9-]{8,64}$")
DEFAULT_MAX_BODY_BYTES = 262_144

logger = logging.getLogger("speakflow_api.http")


class HttpHardeningMiddleware:
    def __init__(
        self,
        app: ASGIApp,
        max_body_bytes: int = DEFAULT_MAX_BODY_BYTES,
    ) -> None:
        self.app = app
        self.max_body_bytes = max_body_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = Headers(scope=scope)
        request_id_header = headers.get("x-request-id", "")
        request_id = (
            request_id_header if REQUEST_ID_PATTERN.fullmatch(request_id_header) else str(uuid4())
        )
        content_length = headers.get("content-length")
        if content_length is not None:
            try:
                too_large = int(content_length) > self.max_body_bytes
            except ValueError:
                too_large = True
            if too_large:
                response = JSONResponse(
                    {"detail": {"code": "request_too_large"}},
                    status_code=413,
                    headers={"X-Request-Id": request_id},
                )
                await response(scope, receive, send)
                return

        started = perf_counter()
        status_code = 500

        async def send_with_headers(message: Message) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
                response_headers = MutableHeaders(scope=message)
                response_headers["X-Request-Id"] = request_id
                response_headers["X-Content-Type-Options"] = "nosniff"
                response_headers["Referrer-Policy"] = "no-referrer"
                response_headers["Cross-Origin-Resource-Policy"] = "same-site"
                response_headers["Cache-Control"] = "no-store"
            await send(message)

        await self.app(scope, receive, send_with_headers)
        duration_ms = round((perf_counter() - started) * 1000, 2)
        logger.info(
            "http_request_complete method=%s path=%s status=%s duration_ms=%s request_id=%s",
            scope.get("method", ""),
            scope.get("path", ""),
            status_code,
            duration_ms,
            request_id,
        )
