from fastapi import APIRouter, HTTPException

from app.schemas.models import SummarizeRequest, SummarizeResponse
from app.services import summarizer
from app.services.ollama import OllamaError

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(body: SummarizeRequest):
    """Generates a structured summary of the course text."""
    try:
        return SummarizeResponse(summary=await summarizer.summarize(body.courseContent))
    except OllamaError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
