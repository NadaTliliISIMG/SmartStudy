from fastapi import FastAPI

from app.config import OLLAMA_MODEL

app = FastAPI(title="Smart Study AI Service", version="0.1.0")


@app.get("/health")
def health():
    """Utilisé par Docker (healthcheck), Jenkins et Nagios."""
    return {"status": "ok", "service": "ai-service", "model": OLLAMA_MODEL}

# Endpoints à ajouter (Phase 3) :
#   POST /api/ai/summarize
#   POST /api/ai/generate-quiz
