import json

from fastapi.testclient import TestClient

from app.main import app
from app.services import ollama, quiz_generator

client = TestClient(app)
COURSE = "HTTP is an application layer protocol used by the web to exchange hypertext documents. " * 3


def question(text="What is HTTP?", options=("A", "B", "C", "D"), answer="B"):
    return {"question": text, "options": list(options), "correctAnswer": answer}


def fake_chat_sequence(*responses):
    """Returns a fake chat() that answers with the given responses, one per call."""
    answers = iter(responses)

    async def fake_chat(system, user, json_mode=False, temperature=0.3):
        return next(answers)

    return fake_chat


def post_quiz(n=2):
    return client.post("/api/ai/generate-quiz", json={"courseContent": COURSE, "numberOfQuestions": n})


def test_quiz_returns_valid_questions(monkeypatch):
    payload = json.dumps({"questions": [question("Q1"), question("Q2", answer="D")]})
    monkeypatch.setattr(ollama, "chat", fake_chat_sequence(payload))
    r = post_quiz(2)
    assert r.status_code == 200
    qs = r.json()["questions"]
    assert len(qs) == 2
    assert all(len(q["options"]) == 4 and q["correctAnswer"] in q["options"] for q in qs)


def test_quiz_filters_invalid_questions(monkeypatch):
    questions = [
        question("good"),
        question("answer not in options", answer="Z"),
        question("duplicate options", options=("A", "A", "C", "D"), answer="A"),
        {"question": "only 3 options", "options": ["A", "B", "C"], "correctAnswer": "A"},
    ]
    monkeypatch.setattr(ollama, "chat", fake_chat_sequence(json.dumps({"questions": questions})))
    r = post_quiz(1)
    assert r.status_code == 200
    assert [q["question"] for q in r.json()["questions"]] == ["good"]


def test_quiz_retries_after_invalid_json(monkeypatch):
    good = json.dumps({"questions": [question("Q1")]})
    monkeypatch.setattr(ollama, "chat", fake_chat_sequence("not json at all", good))
    r = post_quiz(1)
    assert r.status_code == 200
    assert r.json()["questions"][0]["question"] == "Q1"


def test_quiz_accepts_json_surrounded_by_text(monkeypatch):
    wrapped = "Here is your quiz:\n" + json.dumps({"questions": [question("Q1")]}) + "\nGood luck!"
    monkeypatch.setattr(ollama, "chat", fake_chat_sequence(wrapped))
    r = post_quiz(1)
    assert r.status_code == 200


def test_quiz_never_returns_more_than_requested(monkeypatch):
    payload = json.dumps({"questions": [question(f"Q{i}") for i in range(6)]})
    monkeypatch.setattr(ollama, "chat", fake_chat_sequence(payload))
    r = post_quiz(3)
    assert len(r.json()["questions"]) == 3


def test_quiz_fails_with_502_when_nothing_is_valid(monkeypatch):
    bad = json.dumps({"questions": [question(answer="Z")]})
    monkeypatch.setattr(ollama, "chat", fake_chat_sequence(*[bad] * quiz_generator.MAX_ATTEMPTS))
    r = post_quiz(1)
    assert r.status_code == 502


def test_quiz_ollama_down_returns_502(monkeypatch):
    async def boom(*a, **k):
        raise ollama.OllamaError("Ollama is unreachable", 502)

    monkeypatch.setattr(ollama, "chat", boom)
    assert post_quiz(1).status_code == 502


def test_quiz_rejects_invalid_requests():
    assert client.post("/api/ai/generate-quiz", json={"courseContent": "short", "numberOfQuestions": 3}).status_code == 422
    assert client.post("/api/ai/generate-quiz", json={"courseContent": COURSE, "numberOfQuestions": 0}).status_code == 422
    assert client.post("/api/ai/generate-quiz", json={"courseContent": COURSE, "numberOfQuestions": 50}).status_code == 422