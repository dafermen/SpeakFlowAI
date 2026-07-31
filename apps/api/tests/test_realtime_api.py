from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.testclient import TestClient

from speakflow_api.api.realtime import SessionStartLimiter, create_router
from speakflow_api.application.ports.realtime import RealtimeCall, RealtimeGatewayError
from speakflow_api.core.config import Settings


class FakeRealtimeGateway:
    def __init__(self, error: RealtimeGatewayError | None = None) -> None:
        self.error = error
        self.offers: list[str] = []
        self.configs: list[dict[str, Any]] = []

    async def create_call(
        self,
        sdp_offer: str,
        session_config: dict[str, Any],
    ) -> RealtimeCall:
        if self.error:
            raise self.error
        self.offers.append(sdp_offer)
        self.configs.append(session_config)
        return RealtimeCall(
            sdp_answer="v=0\r\na=setup:active\r\n",
            call_id="rtc_test",
        )


def _settings(tmp_path: Path, *, configured: bool = True) -> Settings:
    return Settings(
        environment="test",
        data_dir=tmp_path,
        database_url=f"sqlite:///{(tmp_path / 'test.db').as_posix()}",
        openai_api_key="test-key" if configured else None,
    )


def _client(
    settings: Settings,
    gateway: FakeRealtimeGateway | None,
    limiter: SessionStartLimiter | None = None,
) -> TestClient:
    app = FastAPI()
    app.include_router(create_router(settings, gateway, limiter=limiter))
    return TestClient(app)


def test_realtime_session_is_backend_mediated_and_cost_bounded(tmp_path: Path) -> None:
    gateway = FakeRealtimeGateway()
    with _client(_settings(tmp_path), gateway) as client:
        response = client.post(
            "/api/v1/realtime/session",
            params={
                "scenario_id": "scenario.daily.coffee-shop",
                "voice_id": "voice-calm-1",
                "speaking_speed": "slow",
            },
            content="v=0\r\na=setup:actpass\r\n",
            headers={"Content-Type": "application/sdp"},
        )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/sdp")
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["x-speakflow-call-id"] == "rtc_test"
    assert gateway.offers == ["v=0\r\na=setup:actpass\r\n"]
    config = gateway.configs[0]
    assert config["model"] == "gpt-realtime-2.1-mini"
    assert config["max_output_tokens"] == 350
    assert config["audio"]["output"] == {"voice": "marin", "speed": 0.85}
    assert "coffee order" in config["instructions"]


def test_realtime_returns_controlled_errors_without_leaking_secrets(tmp_path: Path) -> None:
    with _client(_settings(tmp_path, configured=False), None) as client:
        response = client.post(
            "/api/v1/realtime/session",
            params={"scenario_id": "scenario.daily.coffee-shop"},
            content="v=0\r\n",
            headers={"Content-Type": "application/sdp"},
        )
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "realtime_not_configured"
    assert "test-key" not in response.text

    gateway = FakeRealtimeGateway(RealtimeGatewayError("rate-limited", 429))
    with _client(_settings(tmp_path), gateway) as client:
        response = client.post(
            "/api/v1/realtime/session",
            params={"scenario_id": "scenario.daily.coffee-shop"},
            content="v=0\r\n",
            headers={"Content-Type": "application/sdp"},
        )
    assert response.status_code == 429
    assert response.json()["detail"]["code"] == "provider_rate_limit"


def test_realtime_limits_session_start_attempts(tmp_path: Path) -> None:
    gateway = FakeRealtimeGateway()
    with _client(_settings(tmp_path), gateway, SessionStartLimiter()) as client:
        responses = [
            client.post(
                "/api/v1/realtime/session",
                params={"scenario_id": "scenario.daily.coffee-shop"},
                content="v=0\r\n",
                headers={"Content-Type": "application/sdp"},
            )
            for _ in range(6)
        ]

    assert [response.status_code for response in responses] == [200, 200, 200, 200, 200, 429]
    assert responses[-1].headers["retry-after"] == "600"
