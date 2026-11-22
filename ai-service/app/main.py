from fastapi import FastAPI

from app import config

app = FastAPI(title="Smart Study AI Service", version="0.1.0")


@app.get("/health")
def health():
    """Used by Docker healthchecks, Jenkins and Nagios."""
    return {"status": "ok", "service": "ai-service", "model": config.OLLAMA_MODEL}

