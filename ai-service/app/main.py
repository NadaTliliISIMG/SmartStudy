from fastapi import FastAPI

from app import config
from app.routes import ai

app = FastAPI(title="Smart Study AI Service", version="0.2.0")
app.include_router(ai.router)


@app.get("/health")
def health():
    """Used by Docker healthchecks, Jenkins and Nagios."""
    return {"status": "ok", "service": "ai-service", "model": config.OLLAMA_MODEL}