import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_pwned_range(monkeypatch):
    async def fake_get_pwned_from_cache(prefix):
        return ([{"suffix": "FAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKEFA", "count": 42}], True)
    # patch the symbol where it's actually imported in the route handler
    monkeypatch.setattr("app.api.pwned.get_pwned_from_cache", fake_get_pwned_from_cache)
    resp = client.post("/api/v1/pwned-range", json={"prefix": "ABCDE"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["prefix"] == "ABCDE"
    assert data["cache_hit"] is True
    assert isinstance(data["results"], list)
