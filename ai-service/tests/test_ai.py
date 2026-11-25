import asyncio

import httpx
from fastapi.testclient import TestClient

from app import config
from app.main import app
from app.services import ollama

client = TestClient(app)
COURSE = "HTTP is an application layer protocol used by the web to exchange hypertext documents. " * 3


def fake_chat_factory(response):
    async def fake_chat(system, user, json_mode=False, temperature=0.3):
        return response

    return fake_chat


# ---------- API endpoints (Ollama is replaced by a fake) ----------

def test_health():
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"


def test_summarize_returns_summary(monkeypatch):
    monkeypatch.setattr(ollama, "chat", fake_chat_factory("Idée générale : HTTP."))
    r = client.post("/api/ai/summarize", json={"courseContent": COURSE})
    assert r.status_code == 200
    assert r.json()["summary"].startswith("Idée")


def test_summarize_rejects_short_content():
    r = client.post("/api/ai/summarize", json={"courseContent": "too short"})
    assert r.status_code == 422


def test_summarize_empty_model_answer_returns_502(monkeypatch):
    monkeypatch.setattr(ollama, "chat", fake_chat_factory(""))
    r = client.post("/api/ai/summarize", json={"courseContent": COURSE})
    assert r.status_code == 502


def test_summarize_ollama_down_returns_502(monkeypatch):
    async def boom(*a, **k):
        raise ollama.OllamaError("Ollama is unreachable", 502)

    monkeypatch.setattr(ollama, "chat", boom)
    r = client.post("/api/ai/summarize", json={"courseContent": COURSE})
    assert r.status_code == 502


# ---------- Ollama client (HTTP call is replaced by a fake) ----------

def test_chat_disables_thinking_for_qwen3_and_strips_think_blocks(monkeypatch):
    captured = {}

    async def fake_post(self, url, json=None, **kwargs):
        captured["json"] = json
        body = {"message": {"content": "<think>reasoning</think>Final answer"}}
        return httpx.Response(200, json=body, request=httpx.Request("POST", url))

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    monkeypatch.setattr(config, "OLLAMA_MODEL", "qwen3:8b")
    result = asyncio.run(ollama.chat("system", "user"))
    assert captured["json"]["think"] is False
    assert result == "Final answer"


def test_chat_timeout_maps_to_504(monkeypatch):
    async def fake_post(self, url, json=None, **kwargs):
        raise httpx.ReadTimeout("timeout")

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    try:
        asyncio.run(ollama.chat("system", "user"))
        assert False, "OllamaError expected"
    except ollama.OllamaError as e:
        assert e.status_code == 504