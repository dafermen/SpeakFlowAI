from fastapi.testclient import TestClient

from speakflow_api.main import app


def test_public_openapi_contract_contains_mvp_routes_without_secret_fields() -> None:
    schema = TestClient(app).get("/openapi.json").json()
    paths = schema["paths"]

    assert "/api/v1/health" in paths
    assert "/api/v1/learner-profile" in paths
    assert "/api/v1/realtime/session" in paths
    assert "/api/v1/sessions" in paths
    assert "/api/v1/sessions/progress" in paths
    serialized = str(schema).lower()
    assert "openai_api_key" not in serialized
    assert "authorization" not in serialized
