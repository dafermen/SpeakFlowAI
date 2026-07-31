from fastapi.testclient import TestClient

from speakflow_api.main import app


def test_health_endpoint_is_stable() -> None:
    response = TestClient(app).get("/api/v1/health", headers={"X-Request-Id": "test-request-123"})

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "speakflow-api",
        "version": "1.0.0",
    }
    assert response.headers["x-request-id"] == "test-request-123"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["cache-control"] == "no-store"


def test_oversized_requests_are_rejected_before_routing() -> None:
    response = TestClient(app).post(
        "/api/v1/sessions",
        content=b"x" * 262_145,
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 413
    assert response.json() == {"detail": {"code": "request_too_large"}}
    assert response.headers["x-request-id"]


def test_capacitor_origin_is_allowed_without_open_cors() -> None:
    response = TestClient(app).options(
        "/api/v1/health",
        headers={
            "Origin": "https://localhost",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://localhost"
