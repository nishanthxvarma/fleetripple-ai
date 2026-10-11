import os
import pytest
from app.config import Settings
from fastapi.testclient import TestClient
from app.main import app

def test_default_cors_origins(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    s = Settings()
    assert isinstance(s.CORS_ORIGINS, list)
    assert "http://localhost:5173" in s.CORS_ORIGINS
    assert "http://127.0.0.1:5173" in s.CORS_ORIGINS
    assert "http://localhost:3000" in s.CORS_ORIGINS

def test_comma_separated_cors_origins(monkeypatch):
    render_env_val = "https://*.vercel.app,http://localhost:5173"
    monkeypatch.setenv("CORS_ORIGINS", render_env_val)
    s = Settings()
    assert isinstance(s.CORS_ORIGINS, list)
    assert s.CORS_ORIGINS == ["https://*.vercel.app", "http://localhost:5173"]

def test_json_array_cors_origins(monkeypatch):
    json_env_val = '["https://fleetripple-ai.vercel.app", "http://localhost:3000"]'
    monkeypatch.setenv("CORS_ORIGINS", json_env_val)
    s = Settings()
    assert isinstance(s.CORS_ORIGINS, list)
    assert s.CORS_ORIGINS == ["https://fleetripple-ai.vercel.app", "http://localhost:3000"]

def test_single_string_cors_origins(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "https://fleetripple-ai.vercel.app")
    s = Settings()
    assert isinstance(s.CORS_ORIGINS, list)
    assert s.CORS_ORIGINS == ["https://fleetripple-ai.vercel.app"]

def test_direct_list_cors_origins():
    s = Settings(CORS_ORIGINS=["https://custom-domain.com", "http://localhost:5173"])
    assert isinstance(s.CORS_ORIGINS, list)
    assert s.CORS_ORIGINS == ["https://custom-domain.com", "http://localhost:5173"]

def test_cors_middleware_headers():
    client = TestClient(app)

    # 1. Test Vercel origin matches allow_origin_regex
    res_vercel = client.get("/api/health", headers={"Origin": "https://fleetripple-ai.vercel.app"})
    assert res_vercel.status_code == 200
    assert res_vercel.headers.get("access-control-allow-origin") == "https://fleetripple-ai.vercel.app"
    assert res_vercel.headers.get("access-control-allow-credentials") == "true"

    # 2. Test localhost origin
    res_local = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    assert res_local.status_code == 200
    assert res_local.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert res_local.headers.get("access-control-allow-credentials") == "true"

    # 3. Test preflight OPTIONS request
    res_preflight = client.options(
        "/api/health",
        headers={
            "Origin": "https://fleetripple-ai.vercel.app",
            "Access-Control-Request-Method": "GET",
        }
    )
    assert res_preflight.status_code == 200
    assert res_preflight.headers.get("access-control-allow-origin") == "https://fleetripple-ai.vercel.app"

    # 4. Test untrusted origin
    res_untrusted = client.get("/api/health", headers={"Origin": "https://unauthorized-domain.com"})
    assert res_untrusted.status_code == 200
    assert "access-control-allow-origin" not in res_untrusted.headers
